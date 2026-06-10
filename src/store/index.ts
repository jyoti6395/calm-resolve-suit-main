import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import ticketReducer from "./ticketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable objects that may sneak past Firebase auth boundaries
        ignoredActions: ["auth/setAuthUser"],
        ignoredPaths: ["auth.user"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
