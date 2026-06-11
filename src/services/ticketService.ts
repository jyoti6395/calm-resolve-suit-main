import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { sanitizeQuerySnapshot } from "../lib/formatters";
import { Ticket, Message } from "../types/store";

/**
 * Subscribes to real-time updates for a single ticket by its ID.
 * @param ticketId The ID of the ticket.
 * @param onUpdate Callback invoked when the ticket is loaded or updated.
 * @returns An unsubscribe function to clean up the listener.
 */
export function subscribeToTicket(
  ticketId: string,
  onUpdate: (ticket: Ticket) => void,
): () => void {
  return onSnapshot(doc(db, "tickets", ticketId), (snapshot: DocumentSnapshot) => {
    if (snapshot.exists()) {
      const ticketData = { id: snapshot.id, ...snapshot.data() } as Ticket;
      onUpdate(ticketData);
    }
  });
}

/**
 * Subscribes to real-time conversational timeline messages for a single ticket.
 * @param ticketId The ID of the ticket.
 * @param onUpdate Callback invoked when the messages are updated.
 * @returns An unsubscribe function to clean up the listener.
 */
export function subscribeToMessages(
  ticketId: string,
  onUpdate: (messages: Message[]) => void,
): () => void {
  const messagesQuery = query(
    collection(db, "tickets", ticketId, "messages"),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(messagesQuery, (snapshot: QuerySnapshot) => {
    const msgs = sanitizeQuerySnapshot<Message>(snapshot);
    onUpdate(msgs);
  });
}

/**
 * Adds a new message to the ticket conversation timeline.
 * @param ticketId The ID of the ticket.
 * @param message The message payload to add.
 * @returns A promise that resolves when the message is successfully added.
 */
export async function sendTicketMessage(
  ticketId: string,
  message: Omit<Message, "id">,
): Promise<void> {
  await addDoc(collection(db, "tickets", ticketId, "messages"), message);
}
