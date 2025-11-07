import { Router } from "express";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

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
  // Resolve to the source file to work in both dev (ts-node) and prod (dist build)
  const scriptPath = path.resolve(__dirname, "..", "..", "src", "solve_cube.py");

  // Prefer a configured Python interpreter, then venv python, else fallback
  const serverRoot = path.resolve(__dirname, "..", ".."); // points to Server/
  const venvPython = path.join(serverRoot, ".venv", "bin", "python");
  const pythonExec = process.env.PYTHON_BIN || (fs.existsSync(venvPython) ? venvPython : (process.platform === 'win32' ? 'python' : 'python3'));

  execFile(pythonExec, [scriptPath, cube], (error, stdout, stderr) => {
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
