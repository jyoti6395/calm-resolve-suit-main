import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateTicket } from "../store/ticketSlice";
import {
  subscribeToTicket,
  subscribeToMessages,
  sendTicketMessage,
} from "../services/ticketService";
import { Ticket, Message } from "../types/store";
import { serializeTimestamp } from "../lib/formatters";

/**
 * Custom hook to manage the real-time subscriptions and actions for a single ticket workspace.
 * Handles ticket metadata stream, conversational timeline stream, Redux sync, and sending new messages.
 *
 * @param ticketId The active ticket ID from route params.
 */
export function useTicketWorkspace(ticketId: string) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Dual Real-Time Subscriptions Lifecycle Management
  useEffect(() => {
    if (!ticketId) return;

    // Stream 1: Ticket Metadata
    const unsubscribeTicket = subscribeToTicket(ticketId, (ticketData) => {
      setTicket(ticketData);
      // Dispatch snapshot data to update local store matrix
      if (updateTicket) {
        dispatch(updateTicket(ticketData));
      }
    });

    // Stream 2: Conversational Timeline
    const unsubscribeMessages = subscribeToMessages(ticketId, (msgs) => {
      setMessages(msgs);
    });

    // Leak Mitigation: cleanup WebSockets/Listeners
    return () => {
      unsubscribeTicket();
      unsubscribeMessages();
    };
  }, [ticketId, dispatch]);

  /**
   * Action to send a new message in the ticket timeline.
   * Handles user details validation and structural payload construction.
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!user) {
        throw new Error("No authenticated user session found");
      }

      const payload: Omit<Message, "id"> = {
        content,
        ticketId,
        senderId: user.uid,
        senderName: user.displayName || user.email || "Technician",
        createdAt: serializeTimestamp(new Date()),
      };

      await sendTicketMessage(ticketId, payload);
    },
    [ticketId, user],
  );

  return {
    ticket,
    messages,
    user,
    sendMessage,
  };
}
