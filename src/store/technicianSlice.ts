import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { AppDispatch } from "./index";

export interface Technician {
  uid: string;
  name: string;
  initials: string;
  role: string; // maps to category in Firestore
  online: boolean; // status === "active"
}

export interface TechnicianState {
  technicians: Technician[];
  loading: boolean;
  error: string | null;
}

const initialState: TechnicianState = {
  technicians: [],
  loading: true,
  error: null,
};

const getInitials = (name: string): string => {
  if (!name) return "AP";
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    const firstInitial = parts[0][0] || "";
    const lastInitial = parts[parts.length - 1][0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const technicianSlice = createSlice({
  name: "technicians",
  initialState,
  reducers: {
    setTechnicians(state, action: PayloadAction<Technician[]>) {
      state.technicians = action.payload;
      state.loading = false;
      state.error = null;
    },
    setTechniciansLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setTechniciansError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearTechnicianState(state) {
      state.technicians = [];
      state.loading = true;
      state.error = null;
    },
  },
});

export const { setTechnicians, setTechniciansLoading, setTechniciansError, clearTechnicianState } =
  technicianSlice.actions;

/**
 * Real-time listener for technicians from Firebase Firestore.
 */
export const startTechnicianSyncListener = () => (dispatch: AppDispatch) => {
  console.log("[DEBUG] startTechnicianSyncListener triggered!");
  dispatch(setTechniciansLoading(true));

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "technician"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(
        `[DEBUG] startTechnicianSyncListener: successfully fetched ${snapshot.docs.length} documents.`,
      );
      try {
        const mappedTechs: Technician[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const name = data.displayName || data.fullName || data.email || "Technician";
          return {
            uid: docSnap.id,
            name,
            initials: getInitials(name),
            role: data.category || "Generalist",
            online: data.status === "active",
          };
        });
        console.log("[DEBUG] mapped technicians:", mappedTechs);
        dispatch(setTechnicians(mappedTechs));
      } catch (err: unknown) {
        const error = err as Error;
        console.error("[DEBUG] Error parsing technician records:", error);
        dispatch(setTechniciansError("Failed to parse technician records."));
      }
    },
    (error) => {
      console.error("[DEBUG] startTechnicianSyncListener error callback triggered:", error);
      if (error.code === "permission-denied") {
        console.warn(
          "Technician list synchronization query denied: insufficient Firestore permissions for this user role.",
        );
        dispatch(setTechnicians([]));
        return;
      }
      dispatch(setTechniciansError(error.message || "Failed to sync technicians."));
    },
  );

  return unsubscribe;
};

export default technicianSlice.reducer;
