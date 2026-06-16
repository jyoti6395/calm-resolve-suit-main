import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { sanitizeQuerySnapshot } from "../lib/formatters";
import type { RootState } from "./index";

export interface DbNotification {
  id: string;
  title: string;
  body: string;
  tone: "destructive" | "primary" | "success" | "warning";
  createdAt: string;
  userId: string;
  read?: boolean;
}

export interface NotificationState {
  notifications: DbNotification[];
  loading: boolean;
  error: string | null;
  preferences: {
    slaAlerts: boolean;
    newReplies: boolean;
    statusChanges: boolean;
    weeklyDigest: boolean;
  };
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  preferences: {
    slaAlerts: true,
    newReplies: true,
    statusChanges: true,
    weeklyDigest: false,
  },
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<DbNotification[]>) {
      // Sort in-memory to avoid Firestore composite index requirement errors
      state.notifications = [...action.payload].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // descending order (newest first)
      });
      state.loading = false;
      state.error = null;
    },
    setNotificationsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setNotificationsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    togglePreference(state, action: PayloadAction<keyof NotificationState["preferences"]>) {
      state.preferences[action.payload] = !state.preferences[action.payload];
    },
    clearNotificationState(state) {
      state.notifications = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  setNotificationsLoading,
  setNotificationsError,
  togglePreference,
  clearNotificationState,
} = notificationSlice.actions;

import type { AppDispatch } from "./index";

export const startNotificationSyncListener =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setNotificationsLoading(true));

    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) {
      dispatch(
        setNotificationsError("Cannot sync notifications: No authenticated user session found."),
      );
      return () => {};
    }

    let unsubscribeSub: (() => void) | null = null;

    // 1. Try top-level "notifications" query
    const unsubscribeTop = onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", user.uid)),
      (snapshot) => {
        try {
          const mapped = sanitizeQuerySnapshot<DbNotification>(snapshot);
          dispatch(setNotifications(mapped));
        } catch (err: unknown) {
          console.error("Notification parsing error:", err);
        }
      },
      (error) => {
        console.warn(
          "Top-level notifications query failed. Trying user subcollection fallback...",
          error,
        );

        // 2. Fallback to user-specific subcollection: users/{uid}/notifications
        try {
          unsubscribeSub = onSnapshot(
            collection(db, "users", user.uid, "notifications"),
            (snapshot) => {
              const mapped = sanitizeQuerySnapshot<DbNotification>(snapshot);
              dispatch(setNotifications(mapped));
            },
            (subError) => {
              console.error("Both notifications queries failed:", subError);
              dispatch(setNotificationsError(subError.message || "Failed to load notifications."));
              dispatch(setNotifications([]));
            },
          );
        } catch (e) {
          dispatch(setNotificationsError("Failed to initialize notifications fallback stream."));
          dispatch(setNotifications([]));
        }
      },
    );

    return () => {
      unsubscribeTop();
      if (unsubscribeSub) {
        unsubscribeSub();
      }
    };
  };

export default notificationSlice.reducer;
