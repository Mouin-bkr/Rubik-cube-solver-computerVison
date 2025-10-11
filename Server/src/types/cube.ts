// Server-side Rubik's Cube Types (shared with client)

export type Face = "U" | "D" | "L" | "R" | "F" | "B";
export type Color = "white" | "yellow" | "red" | "orange" | "green" | "blue";

export interface CubeState {
  faces: {
    [K in Face]: Color[][];
  };
}

export interface Move {
  face: Face;
  direction: "clockwise" | "counterclockwise";
  double?: boolean;
}

export interface SolvingStep {
  step: number;
  description: string;
  moves: Move[];
  algorithm?: string;
}

export interface SolvingProgress {
  isSolving: boolean;
  currentStep: number;
  totalSteps: number;
  steps: SolvingStep[];
  currentAlgorithm?: string;
}

// Face mapping for easier access
export const FACE_ORDER: Face[] = ["U", "D", "L", "R", "F", "B"];

// Color mapping
export const FACE_COLORS: Record<Face, Color> = {
  U: "white",
  D: "yellow",
  L: "red",
  R: "orange",
  F: "green",
  B: "blue",
};
