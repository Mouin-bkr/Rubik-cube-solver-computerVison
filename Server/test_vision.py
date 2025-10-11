#!/usr/bin/env python3
import sys
import cv2
import numpy as np

print("Testing OpenCV and dependencies...")

try:
    import cv2
    print(f"✓ OpenCV version: {cv2.__version__}")
except ImportError as e:
    print(f"✗ OpenCV import failed: {e}")
    sys.exit(1)

try:
    import numpy as np
    print(f"✓ NumPy version: {np.__version__}")
except ImportError as e:
    print(f"✗ NumPy import failed: {e}")
    sys.exit(1)

try:
    from sklearn.cluster import DBSCAN
    import sklearn
    print(f"✓ scikit-learn version: {sklearn.__version__}")
except ImportError as e:
    print(f"✗ scikit-learn import failed: {e}")
    sys.exit(1)

try:
    from PIL import Image
    import PIL
    print(f"✓ Pillow version: {PIL.__version__}")
except ImportError as e:
    print(f"✗ Pillow import failed: {e}")
    sys.exit(1)

try:
    import flask
    print(f"✓ Flask version: {flask.__version__}")
except ImportError as e:
    print(f"✗ Flask import failed: {e}")
    sys.exit(1)

print("\n✓ All dependencies are installed correctly!")
print("\nCreating a test image to verify CV operations...")

test_img = np.zeros((300, 300, 3), dtype=np.uint8)
test_img[50:250, 50:250] = [255, 0, 0]

gray = cv2.cvtColor(test_img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150)
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

print(f"✓ Created test image: {test_img.shape}")
print(f"✓ Edge detection: {edges.shape}")
print(f"✓ Found {len(contours)} contours")

print("\n✓ Computer vision operations working correctly!")
print("\nYou can now start the Flask server with: python3 src/flask_server.py")
