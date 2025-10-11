import { Router } from "express";
import { execFile } from "child_process";
import path from "path";

const router = Router();

// Start solving process
router.post("/start", (req, res) => {
  try {
    const { cube } = req.body;

    if (!cube) {
      return res.status(400).json({
        success: false,
        error: "Cube state is required",
      });
    }

    // Call the Python script to solve the cube using kociemba
    const scriptPath = path.join(__dirname, "../solve_cube.py");
    execFile("python", [scriptPath, cube], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: stderr || error.message,
        });
      }
      if (stdout.startsWith("ERROR:")) {
        return res.status(400).json({
          success: false,
          error: stdout,
        });
      }
      res.json({
        success: true,
        message: "Solving started",
        solution: stdout.trim(),
        solvingId: Date.now().toString(),
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to start solving",
    });
  }
});

export { router as solvingRoutes };
