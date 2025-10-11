// Rubik's Cube Types and Interfaces

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

// Move notation mapping
export const MOVE_NOTATION: Record<string, Move> = {
  R: { face: "R", direction: "clockwise" },
  "R'": { face: "R", direction: "counterclockwise" },
  R2: { face: "R", direction: "clockwise", double: true },
  L: { face: "L", direction: "clockwise" },
  "L'": { face: "L", direction: "counterclockwise" },
  L2: { face: "L", direction: "clockwise", double: true },
  U: { face: "U", direction: "clockwise" },
  "U'": { face: "U", direction: "counterclockwise" },
  U2: { face: "U", direction: "clockwise", double: true },
  D: { face: "D", direction: "clockwise" },
  "D'": { face: "D", direction: "counterclockwise" },
  D2: { face: "D", direction: "clockwise", double: true },
  F: { face: "F", direction: "clockwise" },
  "F'": { face: "F", direction: "counterclockwise" },
  F2: { face: "F", direction: "clockwise", double: true },
  B: { face: "B", direction: "clockwise" },
  "B'": { face: "B", direction: "counterclockwise" },
  B2: { face: "B", direction: "clockwise", double: true },
};
