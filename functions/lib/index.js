"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoAssignTicket = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
exports.autoAssignTicket = functions.firestore
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
        const technicians = [];
        techniciansSnapshot.forEach((doc) => {
            const data = doc.data();
            technicians.push({
                id: doc.id,
                name: data.displayName || data.fullName || "Unknown Technician",
            });
        });
        // Least-Loaded (Optimistic) Allocation Algorithm
        // Query the current active ticket count for each technician to find who is most available
        const workloads = await Promise.all(technicians.map(async (tech) => {
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
        }));
        // Sort ascending by load so the technician with the least tickets is at index 0
        workloads.sort((a, b) => a.load - b.load);
        const selectedTechnician = workloads[0].tech;
        console.log(`Assigning ticket ${ticketId} to technician ${selectedTechnician.name} (${selectedTechnician.id})`);
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
            }
            catch (e) {
                console.error("Failed to write assignment notification to root:", e);
            }
            try {
                await db.collection("users").doc(ticketData.createdBy).collection("notifications").add(creatorNotif);
            }
            catch (e) {
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
        }
        catch (e) {
            console.error("Failed to write tech assignment notification to root:", e);
        }
        try {
            await db.collection("users").doc(selectedTechnician.id).collection("notifications").add(techNotif);
        }
        catch (e) {
            console.error("Failed to write tech assignment notification to subcollection:", e);
        }
        return null;
    }
    catch (error) {
        console.error(`Error auto-assigning ticket ${ticketId}:`, error);
        return null;
    }
});
exports.onTicketUpdate = functions.firestore
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
            }
            catch (e) {
                console.error("Failed to write status update to root:", e);
            }
            try {
                await db.collection("users").doc(afterData.createdBy).collection("notifications").add(notifPayload);
            }
            catch (e) {
                console.error("Failed to write status update to subcollection:", e);
            }
        }
    }
});
//# sourceMappingURL=index.js.map