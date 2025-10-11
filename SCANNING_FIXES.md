# Rubik's Cube Scanning - Issues and Fixes

## Problems Identified

### 1. Missing Flask Server
- The client was calling `/api/process-frame` but no server was handling this endpoint
- The `cube_detector.py` existed but wasn't connected to any API

### 2. Weak Computer Vision Algorithm
- Hard-coded DBSCAN parameters that don't adapt to different cube sizes
- Poor HSV color thresholds that fail under varying lighting
- Clustering approach tried to find 9 individual stickers instead of one cube face
- No perspective correction validation

### 3. Color Detection Issues
- Simplistic HSV ranges don't handle shadows, glare, or ambient lighting
- No validation that the center sticker matches the expected face color
- Allows up to 6 unknown colors (too permissive)

## Solutions Implemented

### 1. New Flask Server (`flask_server.py`)
- Proper Flask API with `/api/process-frame` endpoint
- Handles base64 image decoding and encoding
- Returns debug images (edges, overlay, warped) for troubleshooting
- Integrated with the existing frontend

### 2. Improved Detection Algorithm

#### Find Largest Square Contour
Instead of clustering multiple small quads, we now:
- Find the largest square-shaped contour (the whole cube face)
- Filter by minimum area (10,000 pixels)
- Check aspect ratio is close to 1:1 (0.7-1.3)
- Use better edge detection with morphological operations

#### Perspective Correction
- Order points consistently (top-left, top-right, bottom-right, bottom-left)
- Warp the cube face to a perfect rectangle
- Extract colors from the corrected perspective

#### Smarter Color Sampling
- Sample from center of each sticker in a 3x3 grid
- Use larger sample patches for better averaging
- Force center sticker to match expected face color
- Use median instead of mean to reduce outlier impact

### 3. Enhanced Color Classification
- Improved HSV thresholds with lighting tolerance
- Better handling of white (low saturation, high value)
- More accurate red detection (wraps around hue at 0/180)
- Rejects very dark colors as unknown
- Stricter validation (max 2 unknown colors, center must match)

## How to Run

### Install Python Dependencies
```bash
cd Server
pip install -r requirements.txt
```

### Start Both Servers
```bash
cd Server
npm install
npm run dev
```

This will start:
- Flask server on port 5000 (computer vision)
- Express server on port 3001 (cube logic)

### Alternative: Run Individually
```bash
npm run dev:flask    # Python/CV server only
npm run dev:express  # Node/Express server only
```

## Tips for Better Scanning

1. **Lighting**: Use bright, even lighting. Avoid harsh shadows or glare.

2. **Distance**: Hold the cube 20-30cm from the camera.

3. **Alignment**: Keep the cube face parallel to the camera.

4. **Stability**: Hold steady while scanning - motion blur affects detection.

5. **Background**: Use a plain, non-reflective background.

6. **Cube Condition**: Clean cube faces scan better than scratched/worn ones.

## Debug Images

When scanning, three debug images are shown:

- **Edges**: Shows the edge detection result
- **Overlay**: Shows the detected contour on the original image
- **Warped**: Shows the perspective-corrected face

If scanning fails:
- Check if the green contour fully captures the cube face in Overlay
- Verify Edges shows clear boundaries
- Ensure Warped shows a square face with visible colors

## Common Issues

### "cube_contour_not_found"
- Cube not visible or too small
- Too much clutter in frame
- Poor edge contrast
- **Fix**: Move closer, clean background, better lighting

### "color_validation_failed"
- Colors detected but don't match expectations
- Too many unknown/ambiguous colors
- Center sticker doesn't match expected face
- **Fix**: Better lighting, reduce glare, check cube orientation

### "perspective_failed"
- Can't compute perspective transform
- Contour detected but malformed
- **Fix**: Hold cube more parallel to camera, reduce rotation

## Color Calibration

If colors are consistently misdetected, you may need to adjust HSV thresholds in `flask_server.py`:

```python
def classify_color_improved(self, h, s, v):
    # Adjust these ranges based on your cube and lighting
    if (h < 15 or h > 170):    # Red
        return 'red'
    elif 15 <= h < 25:          # Orange
        return 'orange'
    # ... etc
```

Test under your actual lighting conditions and adjust ranges accordingly.
