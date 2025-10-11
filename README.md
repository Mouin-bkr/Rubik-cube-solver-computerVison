# Rubik's Cube Scanner & Solver

A React + TypeScript + Flask application to scan a physical Rubik's Cube with a webcam, reconstruct the cube state, and visualize/solve it. The scanner uses computer vision to detect the cube face and classify sticker colors.

## Features

- **Camera Scanning**: Scan a real Rubik's cube using your device camera with guided face-by-face capture
- **Advanced Computer Vision**: OpenCV-based detection with perspective correction and improved color classification
- **3D Visualization**: Interactive 3D cube view using Three.js
- **2D View**: Traditional unfolded cube diagram
- **Solve Algorithm**: Step-by-step solving instructions
- **Debug Mode**: Visual feedback showing edge detection, contour overlay, and perspective correction

## Quick Start

### 1. Install Dependencies

#### Client (Frontend)
```bash
cd Client
npm install
```

#### Server (Backend)
```bash
cd Server
npm install
pip install -r requirements.txt
```

### 2. Verify Python Setup
```bash
cd Server
python3 test_vision.py
```

This will verify that OpenCV, NumPy, scikit-learn, Pillow, and Flask are installed correctly.

### 3. Start Development Servers

From the **Server** directory:
```bash
npm run dev
```

This starts both servers concurrently:
- Flask server (computer vision) on port 5000
- Express server (cube logic) on port 3001

From the **Client** directory (in a new terminal):
```bash
npm run dev
```

This starts the React app on port 5173.

## Project Structure

```
Client/
├── src/
│   ├── components/
│   │   ├── CameraScanner.tsx   # Webcam scanning UI
│   │   ├── CubeSolver.tsx       # Main solver component
│   │   ├── Cube3D.tsx           # 3D visualization
│   │   ├── Cube2D.tsx           # 2D unfolded view
│   │   ├── Controls.tsx         # Manual cube controls
│   │   └── Cubie.tsx            # Individual cube piece
│   ├── store/
│   │   └── cubeStore.ts         # Zustand state management
│   ├── types/
│   │   └── cube.ts              # TypeScript types
│   ├── utils/
│   │   └── cubeLogic.ts         # Cube manipulation logic
│   ├── App.tsx
│   └── main.tsx

Server/
├── src/
│   ├── flask_server.py          # Computer vision API (Flask)
│   ├── index.ts                 # Cube logic API (Express)
│   ├── cube_detector.py         # Original detector (not used)
│   ├── solve_cube.py            # Solving algorithms
│   ├── routes/
│   │   ├── cubeRoutes.ts        # Cube state endpoints
│   │   └── solvingRoutes.ts     # Solving endpoints
│   ├── types/
│   │   └── cube.ts              # TypeScript types
│   └── utils/
│       └── cubeLogic.ts         # Cube manipulation logic
├── requirements.txt
├── package.json
└── test_vision.py               # Dependency verification
```

## Scanning Issues Fixed

The original implementation had several critical issues preventing reliable cube scanning:

### Problems Identified
1. **Missing Flask Server**: The client was calling `/api/process-frame` but no server was handling this endpoint
2. **Weak Detection**: Hard-coded parameters, poor clustering approach, unreliable under different lighting
3. **Color Classification**: Simplistic HSV thresholds that failed with shadows, glare, or ambient lighting

### Solutions Implemented
1. **New Flask Server**: Properly integrated Python computer vision with the frontend
2. **Improved Algorithm**:
   - Detects the entire cube face as one contour (not individual stickers)
   - Perspective correction with proper point ordering
   - Adaptive color sampling from corrected perspective
3. **Better Color Detection**:
   - Improved HSV thresholds with lighting tolerance
   - Forces center sticker to match expected face color
   - Stricter validation (max 2 unknown colors)

See [SCANNING_FIXES.md](./SCANNING_FIXES.md) for detailed technical information.

## Usage Tips

### For Better Scanning Results

1. **Lighting**: Use bright, even lighting without harsh shadows or glare
2. **Distance**: Hold the cube 20-30cm from the camera
3. **Alignment**: Keep the cube face parallel to the camera
4. **Stability**: Hold steady - motion blur affects detection
5. **Background**: Use a plain, non-reflective background
6. **Cube Condition**: Clean cubes scan better than scratched/worn ones

### Debug Images

While scanning, three debug images help troubleshoot:
- **Edges**: Edge detection result
- **Overlay**: Detected contour on the original image (should be green square around face)
- **Warped**: Perspective-corrected face (should show square face with visible colors)

### Common Errors

- **cube_contour_not_found**: Cube not visible, too small, or poor edge contrast
  - Fix: Move closer, clean background, better lighting

- **color_validation_failed**: Colors detected but don't match expectations
  - Fix: Better lighting, reduce glare, check cube orientation

- **perspective_failed**: Can't compute perspective transform
  - Fix: Hold cube more parallel to camera, reduce rotation

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Three.js, React Three Fiber, Zustand
- **Backend (Express)**: Node.js, TypeScript, Socket.io
- **Backend (Flask)**: Python, Flask, Flask-CORS
- **Computer Vision**: OpenCV, NumPy, scikit-learn, Pillow

## Development

### Run Servers Individually
```bash
# Flask only
cd Server
npm run dev:flask

# Express only
cd Server
npm run dev:express
```

### Build for Production
```bash
cd Client
npm run build

cd Server
npm run build
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- A webcam or camera
- Modern browser with WebRTC support

## License

MIT
