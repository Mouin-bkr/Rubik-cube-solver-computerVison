from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import traceback

app = Flask(__name__)
# Allow CORS from configured origin(s) or default to localhost for dev
cors_origin = os.environ.get("CORS_ORIGIN", "http://localhost:5173")
CORS(app, resources={r"/*": {"origins": cors_origin}})

class ImprovedCubeDetector:
    def __init__(self):
        self.face_center_colors = {
            0: 'white',
            1: 'red',
            2: 'yellow',
            3: 'orange',
            4: 'green',
            5: 'blue'
        }

    def decode_image(self, base64_str):
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        img_data = base64.b64decode(base64_str)
        img = Image.open(BytesIO(img_data))
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    def encode_image(self, img):
        _, buffer = cv2.imencode('.jpg', img)
        return 'data:image/jpeg;base64,' + base64.b64encode(buffer).decode()

    def find_largest_square_contour(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edges = cv2.Canny(blurred, 50, 150)
        kernel = np.ones((5, 5), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=1)
        edges = cv2.erode(edges, kernel, iterations=1)

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        valid_contours = []
        for contour in contours:
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

            if len(approx) == 4:
                area = cv2.contourArea(approx)
                if area > 10000:
                    x, y, w, h = cv2.boundingRect(approx)
                    aspect_ratio = float(w) / h if h > 0 else 0
                    if 0.7 < aspect_ratio < 1.3:
                        valid_contours.append((area, approx))

        if not valid_contours:
            return None, edges

        largest = max(valid_contours, key=lambda x: x[0])
        return largest[1], edges

    def order_points(self, pts):
        rect = np.zeros((4, 2), dtype="float32")
        pts = pts.reshape(4, 2)
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]
        return rect

    def warp_perspective(self, frame, contour):
        rect = self.order_points(contour)
        (tl, tr, br, bl) = rect
        widthA = np.linalg.norm(br - bl)
        widthB = np.linalg.norm(tr - tl)
        maxWidth = max(int(widthA), int(widthB))
        heightA = np.linalg.norm(tr - br)
        heightB = np.linalg.norm(tl - bl)
        maxHeight = max(int(heightA), int(heightB))

        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype="float32")

        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(frame, M, (maxWidth, maxHeight))
        return warped

    def extract_sticker_colors(self, warped, expected_center_color):
        h, w = warped.shape[:2]
        colors = []

        grid_positions = []
        for row in range(3):
            for col in range(3):
                x = int((col + 0.5) * w / 3)
                y = int((row + 0.5) * h / 3)
                grid_positions.append((x, y))

        hsv = cv2.cvtColor(warped, cv2.COLOR_BGR2HSV)

        for idx, (x, y) in enumerate(grid_positions):
            sample_size = min(h, w) // 15
            x1 = max(0, x - sample_size)
            x2 = min(w, x + sample_size)
            y1 = max(0, y - sample_size)
            y2 = min(h, y + sample_size)

            patch = hsv[y1:y2, x1:x2]

            if patch.size == 0:
                colors.append('unknown')
                continue

            h_vals = patch[:, :, 0].flatten()
            s_vals = patch[:, :, 1].flatten()
            v_vals = patch[:, :, 2].flatten()

            h_median = np.median(h_vals)
            s_median = np.median(s_vals)
            v_median = np.median(v_vals)

            if idx == 4:
                color = expected_center_color
            else:
                color = self.classify_color_improved(h_median, s_median, v_median)

            colors.append(color)

        return colors

    def classify_color_improved(self, h, s, v):
        if v < 80:
            return 'unknown'

        if s < 50:
            if v > 150:
                return 'white'
            elif v < 120:
                return 'unknown'

        if s > 40:
            if (h < 15 or h > 170):
                return 'red'
            elif 15 <= h < 25:
                return 'orange'
            elif 25 <= h < 40:
                return 'yellow'
            elif 40 <= h < 85:
                return 'green'
            elif 85 <= h < 135:
                return 'blue'

        return 'unknown'

    def validate_colors(self, colors, expected_center):
        if len(colors) != 9:
            return False

        if colors[4] != expected_center:
            return False

        unknown_count = colors.count('unknown')
        if unknown_count > 2:
            return False

        return True

    def process_frame(self, frame, face_index, debug=False):
        result = {
            'success': False,
            'validDetection': False,
            'colors': [],
            'error': None
        }

        expected_center = self.face_center_colors.get(face_index, 'white')

        try:
            contour, edges = self.find_largest_square_contour(frame)

            if debug:
                result['edges'] = self.encode_image(edges)

            if contour is None:
                result['error'] = 'cube_contour_not_found'
                return result

            overlay = frame.copy()
            cv2.drawContours(overlay, [contour], -1, (0, 255, 0), 3)

            if debug:
                result['overlay'] = self.encode_image(overlay)

            warped = self.warp_perspective(frame, contour)

            if debug:
                result['warped'] = self.encode_image(warped)

            colors = self.extract_sticker_colors(warped, expected_center)

            result['colors'] = colors

            if self.validate_colors(colors, expected_center):
                result['success'] = True
                result['validDetection'] = True
            else:
                result['error'] = 'color_validation_failed'

        except Exception as e:
            result['error'] = 'perspective_failed'
            result['exception'] = str(e)

        return result

detector = ImprovedCubeDetector()

@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    try:
        data = request.json
        image_data = data.get('image')
        face_index = data.get('faceIndex', 0)
        debug = data.get('debug', False)

        if not image_data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400

        frame = detector.decode_image(image_data)
        result = detector.process_frame(frame, face_index, debug)

        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'cube-vision-api'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
