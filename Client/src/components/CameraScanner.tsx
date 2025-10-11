// Client/src/components/CameraScanner.tsx

import { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";

const faceCenterColors = [
  "white", // Front
  "red", // Right
  "yellow", // Back
  "orange", // Left
  "green", // Top
  "blue", // Bottom
];

// Map color names to labels with emoji or color swatch (optional)
const faceColorLabels: Record<string, string> = {
  white: "White",
  red: "Red",
  yellow: "Yellow",
  orange: "Orange",
  green: "Green",
  blue: "Blue",
};

interface CameraScannerProps {
  onScanComplete: (cubeState: string, solution: string) => void;
  onCancel: () => void;
  isScanning: boolean;
}

interface ScanProgress {
  currentFace: number;
  totalFaces: number;
  faceNames: string[];
  capturedFaces: string[]; // array of 'WR...'-style colors or raw color names
}

// Prefer avoiding `process` in browser code to prevent TS/node typing issues.
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_URL = isLocalhost
  ? "http://localhost:5000/api/process-frame"
  : "/api/process-frame"; // assume HTTPS + reverse proxy in production

export function CameraScanner({
  onScanComplete,
  onCancel,
}: CameraScannerProps) {
  const webcamRef = useRef<Webcam | null>(null);

  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    currentFace: 0,
    totalFaces: 6,
    faceNames: ["Front", "Right", "Back", "Left", "Top", "Bottom"],
    capturedFaces: [],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [overlayImg, setOverlayImg] = useState<string | null>(null);
  const [edgesImg, setEdgesImg] = useState<string | null>(null);
  const [warpedImg, setWarpedImg] = useState<string | null>(null);

  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [guidanceMessage, setGuidanceMessage] = useState("");

  const videoConstraints = {
    facingMode: { ideal: "environment" as const },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  useEffect(() => {
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setErrorMsg(
        "Camera access requires a secure (HTTPS) connection. Please use a secure URL."
      );
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setErrorMsg("Failed to capture image from camera.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc,
          faceIndex: scanProgress.currentFace,
          debug: true,
        }),
      });

      const result = await res.json();

      // Show debug images if any
      setOverlayImg(result.overlay || null);
      setEdgesImg(result.edges || null);
      setWarpedImg(result.warped || null);

      if (
        result.success &&
        result.validDetection &&
        Array.isArray(result.colors) &&
        result.colors.length === 9
      ) {
        setConsecutiveFailures(0);
        setGuidanceMessage("Face captured successfully.");

        const colorMap: Record<string, string> = {
          white: "W",
          red: "R",
          orange: "O",
          yellow: "Y",
          green: "G",
          blue: "B",
        };
        const asLetters = result.colors.map((c: string) => colorMap[c] ?? "X");
        const newCaptured = [...scanProgress.capturedFaces];
        newCaptured[scanProgress.currentFace] = asLetters.join("");

        const nextFace = scanProgress.currentFace + 1;
        const updated = {
          ...scanProgress,
          capturedFaces: newCaptured,
          currentFace: nextFace,
        };

        setScanProgress(updated);

        // If all faces captured, build cube state and return
        if (nextFace >= scanProgress.totalFaces) {
          // Assemble facelets into Kociemba order (assumes current face ordering matches solver expectation)
          const cubeState = newCaptured.join("");
          // Solution will be computed elsewhere; return state only here
          onScanComplete(cubeState, "");
        }
      } else {
        const newFailures = consecutiveFailures + 1;
        setConsecutiveFailures(newFailures);

        if (result.error === "cube_contour_not_found") {
          setGuidanceMessage(
            "Can't find cube face. Move closer, center the face, and reduce rotation."
          );
        } else if (result.error === "color_validation_failed") {
          setGuidanceMessage(
            "Colors unclear. Improve lighting, avoid glare, and hold steady."
          );
        } else if (result.error === "perspective_failed") {
          setGuidanceMessage(
            "Perspective correction failed. Align the face parallel to the camera."
          );
        } else {
          setGuidanceMessage("Detection failed. Adjust distance and lighting.");
        }

        // Auto retry up to 3 times
        if (newFailures < 3) {
          setTimeout(() => {
            captureFrame();
          }, 1500);
        } else {
          setGuidanceMessage(
            "Detection failed repeatedly. Try a different angle or lighting."
          );
          setConsecutiveFailures(0);
        }
      }
    } catch (e) {
      setErrorMsg("Network or server error during frame processing.");
    } finally {
      setIsProcessing(false);
    }
  }, [scanProgress, consecutiveFailures, onScanComplete]);

  const handleCaptureClick = () => {
    if (!isProcessing) captureFrame();
  };

  const handleCancel = () => {
    setScanProgress({
      currentFace: 0,
      totalFaces: 6,
      faceNames: ["Front", "Right", "Back", "Left", "Top", "Bottom"],
      capturedFaces: [],
    });
    setOverlayImg(null);
    setEdgesImg(null);
    setWarpedImg(null);
    setGuidanceMessage("");
    setErrorMsg(null);
    onCancel();
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ width: "100%", maxWidth: 640, borderRadius: 8 }}
        />
      </div>

      <div>
        <p>
          Face:{" "}
          {faceColorLabels[faceCenterColors[scanProgress.currentFace]] ??
            "Done"}
        </p>
        {guidanceMessage && <p>{guidanceMessage}</p>}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={handleCaptureClick}
          disabled={
            isProcessing || scanProgress.currentFace >= scanProgress.totalFaces
          }
          style={{
            minWidth: 120,
            minHeight: 40,
            ...(isProcessing ? { opacity: 0.8, cursor: "wait" } : {}),
          }}
        >
          {isProcessing
            ? "Processing..."
            : `Scan ${
                faceColorLabels[faceCenterColors[scanProgress.currentFace]] ||
                "Face"
              }`}
        </button>

        <button onClick={handleCancel}>Cancel</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {overlayImg && (
          <div>
            <p>Overlay</p>
            <img src={overlayImg} alt="overlay" style={{ width: "100%" }} />
          </div>
        )}
        {edgesImg && (
          <div>
            <p>Edges</p>
            <img src={edgesImg} alt="edges" style={{ width: "100%" }} />
          </div>
        )}
        {warpedImg && (
          <div>
            <p>Warped</p>
            <img src={warpedImg} alt="warped" style={{ width: "100%" }} />
          </div>
        )}
      </div>

      <div>
        <p>Captured:</p>
        <ul>
          {scanProgress.capturedFaces.map((f, idx) => (
            <li key={idx}>
              {scanProgress.faceNames[idx]}: {f || "-"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
