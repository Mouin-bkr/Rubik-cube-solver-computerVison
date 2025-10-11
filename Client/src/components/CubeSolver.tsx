import { useState } from "react";
import { Cube3D } from "./Cube3D";
import { CameraScanner } from "./CameraScanner";
import { Controls } from "./Controls";
import { useCubeStore } from "../store/cubeStore";

export function CubeSolver() {
  const [viewMode, setViewMode] = useState<"cube" | "camera">("cube");
  const { setCubeFromString } = useCubeStore();

  const handleStartScan = () => setViewMode("camera");
  const handleScanComplete = (cubeState: string, _solution: any) => {
    try {
      setCubeFromString(cubeState);
    } catch (e) {}
    setViewMode("cube");
  };
  const handleCancelScan = () => setViewMode("cube");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rubik's Cube Solver</h1>
        <p>
          Scan your cube, scramble, and solve visually or with computer vision.
        </p>
      </header>
      {viewMode === "cube" && (
        <main className="app-main">
          <div className="cube-container">
            <Cube3D />
          </div>
          <div className="controls-container">
            <Controls onStartScan={handleStartScan} />
          </div>
        </main>
      )}
      {viewMode === "camera" && (
        <main className="app-main">
          <CameraScanner
            onScanComplete={handleScanComplete}
            onCancel={handleCancelScan}
            isScanning={true}
          />
        </main>
      )}
    </div>
  );
}
