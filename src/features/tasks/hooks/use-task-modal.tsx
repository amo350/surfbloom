import { create } from "zustand";

type TaskModalState = {
  isOpen: boolean;
  taskId: string | null;
  open: (taskId: string) => void;
  close: () => void;
};

export const useTaskModal = create<TaskModalState>((set) => ({
  isOpen: false,
  taskId: null,
  open: (taskId) => set({ isOpen: true, taskId }),
  close: () => set({ isOpen: false, taskId: null }),
}));
