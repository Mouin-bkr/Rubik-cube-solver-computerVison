import { Box } from "@react-three/drei";
import type { CubeState } from "../types/cube";

interface CubieProps {
  position: [number, number, number];
  cube: CubeState;
  cubiePosition: [number, number, number];
}

export function Cubie({ position, cube, cubiePosition }: CubieProps) {
  const [x, y, z] = cubiePosition;

  // Get the colors for each face of this cubie
  const getFaceColor = (
    face: keyof CubeState["faces"],
    faceX: number,
    faceY: number
  ) => {
    return cube.faces[face][faceY][faceX];
  };

  // Determine which faces are visible for this cubie
  const faces = [];

  // Front face (F) - visible when z = 2
  if (z === 2) {
    faces.push({
      position: [0, 0, 0.5] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: getFaceColor("F", x, 2 - y),
    });
  }

  // Back face (B) - visible when z = 0
  if (z === 0) {
    faces.push({
      position: [0, 0, -0.5] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
      color: getFaceColor("B", 2 - x, 2 - y),
    });
  }

  // Right face (R) - visible when x = 2
  if (x === 2) {
    faces.push({
      position: [0.5, 0, 0] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      color: getFaceColor("R", 2 - z, 2 - y),
    });
  }

  // Left face (L) - visible when x = 0
  if (x === 0) {
    faces.push({
      position: [-0.5, 0, 0] as [number, number, number],
      rotation: [0, -Math.PI / 2, 0] as [number, number, number],
      color: getFaceColor("L", z, 2 - y),
    });
  }

  // Up face (U) - visible when y = 2
  if (y === 2) {
    faces.push({
      position: [0, 0.5, 0] as [number, number, number],
      rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
      color: getFaceColor("U", x, z),
    });
  }

  // Down face (D) - visible when y = 0
  if (y === 0) {
    faces.push({
      position: [0, -0.5, 0] as [number, number, number],
      rotation: [Math.PI / 2, 0, 0] as [number, number, number],
      color: getFaceColor("D", x, 2 - z),
    });
  }

  return (
    <group position={position}>
      {/* Base cubie structure - only show if it has visible faces */}
      {faces.length > 0 && (
        <Box args={[0.9, 0.9, 0.9]}>
          <meshStandardMaterial color="#333" />
        </Box>
      )}

      {/* Render visible faces */}
      {faces.map((face, index) => (
        <Box
          key={index}
          position={face.position}
          rotation={face.rotation}
          args={[0.85, 0.85, 0.05]}
        >
          <meshStandardMaterial color={face.color} />
        </Box>
      ))}
    </group>
  );
}
