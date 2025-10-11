import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCubeStore } from "../store/cubeStore";
import { Cubie } from "./Cubie";

// Main cube component
export function Cube3D() {
  const { cube } = useCubeStore();

  return (
    <div style={{ width: "500px", height: "500px" }}>
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Create 27 individual cubies (3x3x3) */}
        {Array.from({ length: 3 }, (_, x) =>
          Array.from({ length: 3 }, (_, y) =>
            Array.from({ length: 3 }, (_, z) => (
              <Cubie
                key={`${x}-${y}-${z}`}
                position={[x - 1, y - 1, z - 1]}
                cube={cube}
                cubiePosition={[x, y, z]}
              />
            ))
          )
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
