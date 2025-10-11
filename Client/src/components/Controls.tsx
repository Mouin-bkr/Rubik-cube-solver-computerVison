// Client/src/components/Controls.tsx
import { useState } from "react";
import { useCubeStore } from "../store/cubeStore";
import type { Move } from "../types/cube";
import { MOVE_NOTATION } from "../types/cube";

interface ControlsProps {
  onStartScan: () => void;
}

export function Controls({ onStartScan }: ControlsProps) {
  const {
    resetCube,
    scrambleCube,
    applyMove,
    isSolving,
    setIsSolving,
    isSolved,
    getCubeStateString,
  } = useCubeStore();

  const [solvingResult, setSolvingResult] = useState<{
    success: boolean;
    solution?: string;
    error?: string;
  } | null>(null);

  const handleMove = (move: Move) => {
    if (!isSolving) {
      applyMove(move);
    }
  };

  const handleScramble = () => {
    if (!isSolving) {
      scrambleCube();
    }
  };

  const handleReset = () => {
    if (!isSolving) {
      resetCube();
    }
  };

  // Removed direct call to /api/scan-cube. Use the camera scanner view instead.
  const handleComputerVisionScan = () => {
    if (isSolving) return;
    onStartScan();
  };

  const handleSolve = async () => {
    if (isSolving) return;
    setSolvingResult(null);
    setIsSolving(true);
    try {
      const cubeState = getCubeStateString();
      const response = await fetch("http://localhost:3001/api/solving/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cube: cubeState }),
      });
      const data = await response.json();
      if (data.success) {
        setSolvingResult({ success: true, solution: data.solution });
      } else {
        setSolvingResult({
          success: false,
          error: data.error || "Failed to solve cube.",
        });
      }
    } catch (err: unknown) {
      setSolvingResult({
        success: false,
        error: "Error connecting to solver.",
      });
    }
    setIsSolving(false);
  };

  return (
    <div className="controls">
      <div className="control-section">
        <h3>Cube Actions</h3>
        <div className="button-group">
          <button onClick={handleReset} disabled={isSolving}>
            Reset Cube
          </button>
          <button onClick={handleScramble} disabled={isSolving}>
            Scramble
          </button>
          <button
            onClick={handleSolve}
            disabled={isSolved() || isSolving}
            className={isSolving ? "solving" : ""}
          >
            {isSolving ? "Solving..." : "Solve Cube"}
          </button>
          <button
            onClick={handleComputerVisionScan}
            disabled={isSolving}
            className="cv-scan-button"
          >
            {isSolving ? "Scanning..." : "📷 Scan Physical Cube"}
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Manual Moves</h3>
        <div className="move-buttons">
          {Object.entries(MOVE_NOTATION).map(([notation, move]) => (
            <button
              key={notation}
              onClick={() => handleMove(move)}
              disabled={isSolving}
              className="move-button"
            >
              {notation}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <h3>Status</h3>
        <div className="status">
          <p>Status: {isSolved() ? "✅ Solved!" : "❌ Not Solved"}</p>
          <p>Solving: {isSolving ? "🔄 In Progress" : "⏸️ Stopped"}</p>
          {solvingResult && (
            <div className="solving-result">
              <p>
                Last Solution:{" "}
                {solvingResult.success ? "✅ Success" : "❌ Failed"}
              </p>
              {solvingResult.success && <p>Moves: {solvingResult.solution}</p>}
              {solvingResult.error && (
                <p className="error">Error: {solvingResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
