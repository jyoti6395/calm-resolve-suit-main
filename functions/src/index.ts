import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

export const autoAssignTicket = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snap, context) => {
    const ticketId = context.params.ticketId;
    const ticketData = snap.data();

    // Prevent infinite loops if the document somehow already has an assignee
    if (ticketData.assignedToId) {
      console.log(`Ticket ${ticketId} is already assigned. Skipping auto-assignment.`);
      return null;
    }

    try {
      // Find all active technicians
      const techniciansSnapshot = await db
        .collection("users")
        .where("role", "==", "technician")
        .where("status", "==", "active")
        .get();

      if (techniciansSnapshot.empty) {
        console.error("No active technicians found. Ticket remains unassigned.");
        return null;
      }

      // Convert snapshot to an array of technicians
      const technicians: Array<{ id: string; name: string }> = [];
      techniciansSnapshot.forEach((doc) => {
        const data = doc.data();
        technicians.push({
          id: doc.id,
          name: data.displayName || data.fullName || "Unknown Technician",
        });
      });

      // Least-Loaded (Optimistic) Allocation Algorithm
      // Query the current active ticket count for each technician to find who is most available
      const workloads = await Promise.all(
        technicians.map(async (tech) => {
          const loadSnapshot = await db
            .collection("tickets")
            .where("assignedToId", "==", tech.id)
            .where("status", "in", ["open", "in_progress"])
            .count()
            .get();

          return {
            tech,
            load: loadSnapshot.data().count,
          };
        }),
      );

      // Sort ascending by load so the technician with the least tickets is at index 0
      workloads.sort((a, b) => a.load - b.load);
      const selectedTechnician = workloads[0].tech;

      console.log(
        `Assigning ticket ${ticketId} to technician ${selectedTechnician.name} (${selectedTechnician.id})`
      );

      // Securely patch the ticket document with the assigned technician
      await snap.ref.update({
        assignedToId: selectedTechnician.id,
        assignedToName: selectedTechnician.name,
      });

      console.log(`Successfully assigned ticket ${ticketId}`);

      // 1. Create notification for the customer (creator)
      if (ticketData.createdBy) {
        const creatorNotif = {
          title: "Technician assigned",
          body: `${selectedTechnician.name} has been assigned to your ticket: "${ticketData.subject || "unnamed"}".`,
          tone: "primary",
          createdAt: new Date().toISOString(),
          userId: ticketData.createdBy,
          read: false,
        };
        try {
          await db.collection("notifications").add(creatorNotif);
        } catch (e) {
          console.error("Failed to write assignment notification to root:", e);
        }
        try {
          await db
            .collection("users")
            .doc(ticketData.createdBy)
            .collection("notifications")
            .add(creatorNotif);
        } catch (e) {
          console.error("Failed to write assignment notification to subcollection:", e);
        }
      }

      // 2. Create notification for the assigned technician
      const techNotif = {
        title: "New ticket assigned",
        body: `You have been assigned to ticket: "${ticketData.subject || "unnamed"}".`,
        tone: "primary",
        createdAt: new Date().toISOString(),
        userId: selectedTechnician.id,
        read: false,
      };
      try {
        await db.collection("notifications").add(techNotif);
      } catch (e) {
        console.error("Failed to write tech assignment notification to root:", e);
      }
      try {
        await db
          .collection("users")
          .doc(selectedTechnician.id)
          .collection("notifications")
          .add(techNotif);
      } catch (e) {
        console.error("Failed to write tech assignment notification to subcollection:", e);
      }

      return null;
    } catch (error) {
      console.error(`Error auto-assigning ticket ${ticketId}:`, error);
      return null;
    }
  });

export const onTicketUpdate = functions.firestore
  .document("tickets/{ticketId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status changed
    if (beforeData.status !== afterData.status) {
      const isResolved = afterData.status === "resolved";
      const statusText = afterData.status.replace("_", " ");
      const notifPayload = {
        title: isResolved ? "Ticket resolved" : `Ticket ${statusText}`,
        body: `Your ticket "${afterData.subject || ""}" is now ${statusText}.`,
        tone: isResolved ? "success" : "warning",
        createdAt: new Date().toISOString(),
        userId: afterData.createdBy,
        read: false,
      };

      if (afterData.createdBy) {
        try {
          await db.collection("notifications").add(notifPayload);
        } catch (e) {
          console.error("Failed to write status update to root:", e);
        }
        try {
          await db
            .collection("users")
            .doc(afterData.createdBy)
            .collection("notifications")
            .add(notifPayload);
        } catch (e) {
          console.error("Failed to write status update to subcollection:", e);
        }
      }
    }
  });

// Utility to verify super_admin role
async function requireSuperAdmin(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only super_admin users can perform this action."
    );
  }
}

export const appProvisionTechnician = functions.https.onCall(async (data, context) => {
  // 1. Verify caller is authenticated and is a super_admin
  await requireSuperAdmin(context);

  const {
    email,
    password,
    displayName,
    department,
    phoneNumber,
    employeeId,
    skills,
  } = data;

  if (!email || !password || !displayName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: email, password, or displayName."
    );
  }

  try {
    // 2. Create the user in Firebase Authentication using Admin SDK
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
    });

    // 3. Create the corresponding profile document in Firestore
    const techData = {
      email: email.toLowerCase().trim(),
      displayName: displayName.trim(),
      department: department || "",
      phoneNumber: phoneNumber?.trim() || "",
      employeeId: employeeId?.trim() || "",
      skills: skills || [],
      role: "technician",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(userRecord.uid).set(techData);

    return {
      success: true,
      uid: userRecord.uid,
      message: "Technician successfully provisioned.",
    };
  } catch (error: any) {
    console.error("Error provisioning technician:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to provision technician");
  }
});
