import { Router } from "express";
import {
  createSolvedCube,
  createScrambledCube,
  applyMove,
  isCubeSolved,
} from "../utils/cubeLogic";
import { Move } from "../types/cube";

const router = Router();

// Get solved cube state
router.get("/solved", (req, res) => {
  try {
    const cube = createSolvedCube();
    res.json({ success: true, cube });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create solved cube" });
  }
});

// Get scrambled cube state
router.get("/scrambled", (req, res) => {
  try {
    const cube = createScrambledCube();
    res.json({ success: true, cube });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create scrambled cube" });
  }
});

// Apply move to cube
router.post("/move", (req, res) => {
  try {
    const { cube, move }: { cube: any; move: Move } = req.body;

    if (!cube || !move) {
      return res.status(400).json({
        success: false,
        error: "Cube state and move are required",
      });
    }

    const newCube = JSON.parse(JSON.stringify(cube)); // Deep clone
    applyMove(newCube, move);

    const solved = isCubeSolved(newCube);

    res.json({
      success: true,
      cube: newCube,
      isSolved: solved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to apply move",
    });
  }
});

// Check if cube is solved
router.post("/check-solved", (req, res) => {
  try {
    const { cube } = req.body;

    if (!cube) {
      return res.status(400).json({
        success: false,
        error: "Cube state is required",
      });
    }

    const solved = isCubeSolved(cube);

    res.json({
      success: true,
      isSolved: solved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to check cube state",
    });
  }
});

export { router as cubeRoutes };
