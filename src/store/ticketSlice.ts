import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { sanitizeQuerySnapshot } from "../lib/formatters";
import type { RootState } from "./index";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

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
  setTicketFilters,
  clearTicketState,
  setTicketsLoading,
  setTicketsError,
} = ticketSlice.actions;

/**
 * REAL-TIME SYNCHRONIZED STREAM SUB-MODULE (THUNKS)
 * Initializes an active Firestore collection listener stream.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const startTicketSyncListener = () => (dispatch: any, getState: () => any) => {
  dispatch(setTicketsLoading(true));

  const state = getState() as RootState;
  const user = state.auth.user;

  if (!user) {
    dispatch(setTicketsError("Cannot sync tickets: No authenticated user session found."));
    return () => {}; // Return a no-op unsubscribe function
  }

  const ticketsRef = collection(db, "tickets");
  let q;

  // Construct optimized, compound multi-index queries depending on access rights
  if (user.role === "super_admin") {
    // Admins track the full corporate scope
    q = query(ticketsRef);
  } else {
    // Technicians or regular users only listen to rows matching their assigned UID
    q = query(ticketsRef, where("assignedTo", "==", user.uid));
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      try {
        const mappedTickets = sanitizeQuerySnapshot<Ticket>(snapshot);
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
