import { create } from "zustand";
import type { CubeState, Move, Face, Color } from "../types/cube";
import {
  createSolvedCube,
  createScrambledCube,
  applyMove,
  isCubeSolved,
} from "../utils/cubeLogic";

interface CubeStore {
  cube: CubeState;
  isSolving: boolean;
  resetCube: () => void;
  scrambleCube: () => void;
  applyMove: (move: Move) => void;
  applyMoves: (moves: Move[]) => void;
  setIsSolving: (isSolving: boolean) => void;
  isSolved: () => boolean;
  getCubeStateString: () => string;
  setCubeFromString: (cubeString: string) => void; // <-- Add this line
}

export const useCubeStore = create<CubeStore>((set, get) => ({
  cube: createSolvedCube(),
  isSolving: false,

  resetCube: () =>
    set({
      cube: createSolvedCube(),
      isSolving: false,
    }),

  scrambleCube: () =>
    set({
      cube: createScrambledCube(),
      isSolving: false,
    }),

  applyMove: (move: Move) => {
    const { cube } = get();
    const newCube = JSON.parse(JSON.stringify(cube)); // Deep clone
    applyMove(newCube, move);
    set({ cube: newCube });
  },

  applyMoves: (moves: Move[]) => {
    const { cube } = get();
    const newCube = JSON.parse(JSON.stringify(cube)); // Deep clone
    moves.forEach((move) => applyMove(newCube, move));
    set({ cube: newCube });
  },

  setIsSolving: (isSolving: boolean) => set({ isSolving }),

  isSolved: () => {
    const { cube } = get();
    return isCubeSolved(cube);
  },

  getCubeStateString: () => {
    const { cube } = get();
    // Kociemba expects faces in this order: U, R, F, D, L, B
    const faceOrder: Face[] = ["U", "R", "F", "D", "L", "B"];
    // Map color names to kociemba letters
    const colorToLetter: Record<Color, string> = {
      white: "U",
      yellow: "D",
      red: "L",
      orange: "R",
      green: "F",
      blue: "B",
    };
    let state = "";
    for (const face of faceOrder) {
      // Flatten the 2D array for each face
      const stickers = cube.faces[face].flat();
      state += stickers.map((color) => colorToLetter[color]).join("");
    }
    return state;
  },
  setCubeFromString: (cubeString: string) => {
    // Convert Kociemba string back to CubeState
    const letterToColor: Record<string, Color> = {
      U: "white",
      D: "yellow",
      L: "red",
      R: "orange",
      F: "green",
      B: "blue",
    };
    const faceOrder: Face[] = ["U", "R", "F", "D", "L", "B"];
    const newCube = createSolvedCube();

    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      const face = faceOrder[faceIndex];
      const startIndex = faceIndex * 9;

      for (let stickerIndex = 0; stickerIndex < 9; stickerIndex++) {
        const row = Math.floor(stickerIndex / 3);
        const col = stickerIndex % 3;
        const letter = cubeString[startIndex + stickerIndex];
        const color = letterToColor[letter];

        newCube.faces[face][row][col] = color;
      }
    }
    set({ cube: newCube, isSolving: false });
  },
}));
