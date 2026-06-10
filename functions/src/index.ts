import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
        })
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
      return null;
    } catch (error) {
      console.error(`Error auto-assigning ticket ${ticketId}:`, error);
      return null;
    }
  });
