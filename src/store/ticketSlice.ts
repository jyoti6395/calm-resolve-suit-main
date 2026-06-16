import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, query, where, onSnapshot, or } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { sanitizeQuerySnapshot } from "../lib/formatters";
import type { RootState } from "./index";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

import type { Ticket } from "../types/store";

export interface TicketFilters {
  searchQuery: string;
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  pageOffset: number;
}

export interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
}

const initialState: TicketState = {
  tickets: [],
  loading: true,
  error: null,
  filters: {
    searchQuery: "",
    statuses: [],
    priorities: [],
    pageOffset: 0,
  },
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setTickets(state, action: PayloadAction<Ticket[]>) {
      state.tickets = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateTicket(state, action: PayloadAction<Ticket>) {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      } else {
        state.tickets.push(action.payload);
      }
    },
    setTicketFilters(state, action: PayloadAction<Partial<TicketFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTicketState(state) {
      state.tickets = [];
      state.loading = true;
      state.error = null;
      state.filters = {
        searchQuery: "",
        statuses: [],
        priorities: [],
        pageOffset: 0,
      };
    },
    setTicketsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setTicketsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setTickets,
  updateTicket,
  setTicketFilters,
  clearTicketState,
  setTicketsLoading,
  setTicketsError,
} = ticketSlice.actions;

/**
 * REAL-TIME SYNCHRONIZED STREAM SUB-MODULE (THUNKS)
 * Initializes an active Firestore collection listener stream.
 */
import type { AppDispatch } from "./index";

export const startTicketSyncListener = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setTicketsLoading(true));

  const state = getState() as RootState;
  const user = state.auth.user;

  if (!user) {
    dispatch(setTicketsError("Cannot sync tickets: No authenticated user session found."));
    return () => {}; // Return a no-op unsubscribe function
  }

  const ticketsRef = collection(db, "tickets");
  let q;

  // Construct optimized queries depending on access rights
  if (user.role === "super_admin") {
    // Admins track the full corporate scope
    q = query(ticketsRef);
  } else if (user.role === "technician") {
    // Technicians track tickets assigned to them or created by them
    q = query(
      ticketsRef,
      or(where("assignedToId", "==", user.uid), where("createdBy", "==", user.uid)),
    );
  } else {
    // Customers and other standard users only see tickets they raised/created
    q = query(ticketsRef, where("createdBy", "==", user.uid));
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(`[DEBUG:Firebase] onSnapshot fired! Received ${snapshot.docs.length} documents.`);
      try {
        const mappedTickets = sanitizeQuerySnapshot<Ticket>(snapshot);
        console.log(`[DEBUG:Firebase] mappedTickets:`, mappedTickets);
        dispatch(setTickets(mappedTickets));
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Ticket Sanitization Error:", error);
        dispatch(setTicketsError("Failed to parse incoming ticket stream."));
      }
    },
    (error) => {
      console.error("Ticket stream socket error:", error);
      dispatch(setTicketsError(error.message || "Lost connection to the ticket stream."));
    },
  );

  return unsubscribe;
};

export default ticketSlice.reducer;
