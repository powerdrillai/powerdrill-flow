import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SelectedDataset } from "@/types/data";

export interface SessionMapItem {
  tempUserMessage: string;
  selectedDataset: SelectedDataset | null;
}

export interface SessionMap {
  [key: string]: SessionMapItem;
}

interface SessionState {
  sessionMap: SessionMap;
  clearSession: (key: string) => void;
  setTempUserMessage: (key: string, message: string) => void;
  setDataset: (key: string, file: SelectedDataset | null) => void;
  setSession: (key: string, sessionState: SessionMapItem) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionMap: {},

      clearSession: (key: string) =>
        set((state) => ({
          sessionMap: produce(state.sessionMap, (draft) => {
            if (key in draft) {
              delete draft[key];
            }
          }),
        })),

      setTempUserMessage: (key: string, message: string) =>
        set((state) => ({
          sessionMap: produce(state.sessionMap, (draft) => {
            if (!draft[key]) {
              draft[key] = { tempUserMessage: "", selectedDataset: null };
            }
            draft[key].tempUserMessage = message;
          }),
        })),

      setDataset: (key, file) =>
        set((state) => ({
          sessionMap: produce(state.sessionMap, (draft) => {
            if (!draft[key]) {
              draft[key] = { tempUserMessage: "", selectedDataset: null };
            }
            draft[key].selectedDataset = file;
          }),
        })),

      setSession: (key, sessionState) =>
        set((state) => ({
          sessionMap: produce(state.sessionMap, (draft) => {
            draft[key] = sessionState;
          }),
        })),
    }),
    {
      name: "session-state",
    }
  )
);
