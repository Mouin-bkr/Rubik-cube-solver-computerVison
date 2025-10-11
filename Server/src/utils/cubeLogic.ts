import {
  CubeState,
  Face,
  Color,
  Move,
  FACE_ORDER,
  FACE_COLORS,
} from "../types/cube";

// Initialize a solved Rubik's cube
export function createSolvedCube(): CubeState {
  const faces: CubeState["faces"] = {} as CubeState["faces"];

  FACE_ORDER.forEach((face) => {
    faces[face] = Array(3)
      .fill(null)
      .map(() => Array(3).fill(FACE_COLORS[face]));
  });

  return { faces };
}

// Create a scrambled cube
export function createScrambledCube(): CubeState {
  const cube = createSolvedCube();
  const moves = generateRandomScramble(20);

  moves.forEach((move) => {
    applyMove(cube, move);
  });

  return cube;
}

// Generate random scramble
export function generateRandomScramble(length: number = 20): Move[] {
  const moves: Move[] = [];
  const faces: Face[] = ["U", "D", "L", "R", "F", "B"];
  const directions: ("clockwise" | "counterclockwise")[] = [
    "clockwise",
    "counterclockwise",
  ];

  for (let i = 0; i < length; i++) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const double = Math.random() < 0.1; // 10% chance for double moves

    moves.push({ face, direction, double });
  }

  return moves;
}

// Apply a move to the cube
export function applyMove(cube: CubeState, move: Move): void {
  const { face, direction, double } = move;
  const rotations = double ? 2 : direction === "clockwise" ? 1 : 3;

  for (let i = 0; i < rotations; i++) {
    rotateFace(cube, face);
  }
}

// Rotate a face clockwise
function rotateFace(cube: CubeState, face: Face): void {
  const faceData = cube.faces[face];

  // Rotate the face itself
  const rotated = [
    [faceData[2][0], faceData[1][0], faceData[0][0]],
    [faceData[2][1], faceData[1][1], faceData[0][1]],
    [faceData[2][2], faceData[1][2], faceData[0][2]],
  ];

  cube.faces[face] = rotated;

  // Rotate the adjacent edges
  rotateAdjacentEdges(cube, face);
}

// Rotate adjacent edges when a face is rotated
function rotateAdjacentEdges(cube: CubeState, face: Face): void {
  switch (face) {
    case "U":
      // Rotate top edges of F, R, B, L
      const tempU = [...cube.faces.F[0]];
      cube.faces.F[0] = [...cube.faces.R[0]];
      cube.faces.R[0] = [...cube.faces.B[0]];
      cube.faces.B[0] = [...cube.faces.L[0]];
      cube.faces.L[0] = tempU;
      break;

    case "D":
      // Rotate bottom edges of F, L, B, R
      const tempD = [...cube.faces.F[2]];
      cube.faces.F[2] = [...cube.faces.L[2]];
      cube.faces.L[2] = [...cube.faces.B[2]];
      cube.faces.B[2] = [...cube.faces.R[2]];
      cube.faces.R[2] = tempD;
      break;

    case "L":
      // Rotate left edges of U, F, D, B
      const tempL = [
        cube.faces.U[0][0],
        cube.faces.U[1][0],
        cube.faces.U[2][0],
      ];
      cube.faces.U[0][0] = cube.faces.B[2][2];
      cube.faces.U[1][0] = cube.faces.B[1][2];
      cube.faces.U[2][0] = cube.faces.B[0][2];
      cube.faces.B[0][2] = cube.faces.D[2][0];
      cube.faces.B[1][2] = cube.faces.D[1][0];
      cube.faces.B[2][2] = cube.faces.D[0][0];
      cube.faces.D[0][0] = cube.faces.F[0][0];
      cube.faces.D[1][0] = cube.faces.F[1][0];
      cube.faces.D[2][0] = cube.faces.F[2][0];
      cube.faces.F[0][0] = tempL[0];
      cube.faces.F[1][0] = tempL[1];
      cube.faces.F[2][0] = tempL[2];
      break;

    case "R":
      // Rotate right edges of U, B, D, F
      const tempR = [
        cube.faces.U[0][2],
        cube.faces.U[1][2],
        cube.faces.U[2][2],
      ];
      cube.faces.U[0][2] = cube.faces.F[0][2];
      cube.faces.U[1][2] = cube.faces.F[1][2];
      cube.faces.U[2][2] = cube.faces.F[2][2];
      cube.faces.F[0][2] = cube.faces.D[0][2];
      cube.faces.F[1][2] = cube.faces.D[1][2];
      cube.faces.F[2][2] = cube.faces.D[2][2];
      cube.faces.D[0][2] = cube.faces.B[2][0];
      cube.faces.D[1][2] = cube.faces.B[1][0];
      cube.faces.D[2][2] = cube.faces.B[0][0];
      cube.faces.B[0][0] = tempR[2];
      cube.faces.B[1][0] = tempR[1];
      cube.faces.B[2][0] = tempR[0];
      break;

    case "F":
      // Rotate front edges of U, R, D, L
      const tempF = [...cube.faces.U[2]];
      cube.faces.U[2] = [
        cube.faces.L[2][2],
        cube.faces.L[1][2],
        cube.faces.L[0][2],
      ];
      cube.faces.L[0][2] = cube.faces.D[0][0];
      cube.faces.L[1][2] = cube.faces.D[0][1];
      cube.faces.L[2][2] = cube.faces.D[0][2];
      cube.faces.D[0] = [
        cube.faces.R[2][0],
        cube.faces.R[1][0],
        cube.faces.R[0][0],
      ];
      cube.faces.R[0][0] = tempF[0];
      cube.faces.R[1][0] = tempF[1];
      cube.faces.R[2][0] = tempF[2];
      break;

    case "B":
      // Rotate back edges of U, L, D, R
      const tempB = [...cube.faces.U[0]];
      cube.faces.U[0] = [
        cube.faces.R[0][2],
        cube.faces.R[1][2],
        cube.faces.R[2][2],
      ];
      cube.faces.R[0][2] = cube.faces.D[2][2];
      cube.faces.R[1][2] = cube.faces.D[2][1];
      cube.faces.R[2][2] = cube.faces.D[2][0];
      cube.faces.D[2] = [
        cube.faces.L[0][0],
        cube.faces.L[1][0],
        cube.faces.L[2][0],
      ];
      cube.faces.L[0][0] = tempB[2];
      cube.faces.L[1][0] = tempB[1];
      cube.faces.L[2][0] = tempB[0];
      break;
  }
}

// Check if cube is solved
export function isCubeSolved(cube: CubeState): boolean {
  return FACE_ORDER.every((face) => {
    const faceData = cube.faces[face];
    const expectedColor = FACE_COLORS[face];
    return faceData.every((row) => row.every((cell) => cell === expectedColor));
  });
}
