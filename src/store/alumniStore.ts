import { create } from "zustand";
import { Alumni } from "../types";

interface AlumniState {
  alumni: Alumni[];
  setAlumni: (alumni: Alumni[]) => void;
}

export const useAlumniStore = create<AlumniState>((set) => ({
  alumni: [],
  setAlumni: (alumni) => set({ alumni }),
}));
