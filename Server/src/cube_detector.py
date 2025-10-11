import cv2
import numpy as np
from sklearn.cluster import DBSCAN

class CubeDetector:
    def __init__(self):
        self.detected_faces = {}
        self.current_face_index = 0
        self.face_order = ['front', 'right', 'back', 'left', 'top', 'bottom']

    def find_quads(self, frame):
        """Detect all quadrilaterals that could be cube stickers."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 30, 150)
        kernel = np.ones((3, 3), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=2)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        quads = []
        areas = []
        for contour in contours:
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
            if len(approx) == 4:
                area = cv2.contourArea(approx)
                if 250 < area < 5000:
                    quads.append(approx)
                    areas.append(area)
        return quads

    def cluster_quads_grid(self, quads):
        """Cluster sticker quads into rows & columns using their center points."""
        if len(quads) < 5:
            return None
        centers = np.array([np.mean(q.reshape(4, 2), axis=0) for q in quads])

        # DBSCAN clusters points into up to 9 stickers
        clustering = DBSCAN(eps=40, min_samples=1).fit(centers)
        labels = clustering.labels_
        cubes = []
        # Group each cluster by label
        for label in set(labels):
            indices = np.where(labels == label)[0]
            cluster = centers[indices]
            if len(cluster) > 2:
                cubes.append(cluster)
        # Pick cluster with most points
        cube_pts = max(cubes, key=len) if cubes else None
        if cube_pts is None or len(cube_pts) < 5:
            return None
        # Now fit points to 3x3 grid using row/col sorting
        # Use y-sort (rows) then x-sort each row
        cube_pts = sorted(cube_pts, key=lambda pt: pt[1])  # sort by y
        rows = [sorted(cube_pts[i::3], key=lambda pt: pt[0]) for i in range(3)]
        flat_grid = [pt for row in rows for pt in row]
        # If not enough points, pad with mean location
        while len(flat_grid) < 9:
            flat_grid.append(np.mean(flat_grid, axis=0))
        return flat_grid

    def extract_sticker_colors(self, frame, grid_pts):
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        colors = []
        for pt in grid_pts:
            x, y = map(int, pt)
            patch = hsv[max(0, y-8):min(hsv.shape[0], y+8), max(0, x-8):min(hsv.shape[1], x+8)]
            h_med = int(np.median(patch[:,:,0])) if patch.size>0 else 0
            s_med = int(np.median(patch[:,:,1])) if patch.size>0 else 0
            v_med = int(np.median(patch[:,:,2])) if patch.size>0 else 0
            color = self.classify_color(h_med, s_med, v_med)
            colors.append(color)
        return colors

    def classify_color(self, h, s, v):
        # Example HSV band - you'll need to calibrate!
        if s < 40 and v > 170: return 'white'
        if 0 <= h <= 10 or 160 <= h <= 179: return 'red'
        if 11 <= h <= 30: return 'orange'
        if 31 <= h <= 40: return 'yellow'
        if 41 <= h <= 80: return 'green'
        if 81 <= h <= 130: return 'blue'
        return 'unknown'

    def validate_face_colors(self, colors):
        return isinstance(colors, list) and len(colors) == 9 and colors.count('unknown') <= 6

    def scan_cube_face(self, frame):
        quads = self.find_quads(frame)
        grid_pts = self.cluster_quads_grid(quads)
        if grid_pts is None or len(grid_pts) < 9:
            return None, None, 'Could not find 9 stickers'
        colors = self.extract_sticker_colors(frame, grid_pts)
        valid = self.validate_face_colors(colors)
        return colors if valid else None, grid_pts, 'Scan failed (color)'
