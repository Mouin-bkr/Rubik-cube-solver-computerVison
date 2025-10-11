import { useCubeStore } from "../store/cubeStore";

export function Cube2D() {
  const { cube } = useCubeStore();

  const faceStyle = {
    width: "60px",
    height: "60px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2px",
    border: "2px solid #333",
    padding: "4px",
    backgroundColor: "#f0f0f0",
  };

  const cellStyle = {
    width: "16px",
    height: "16px",
    border: "1px solid #666",
    borderRadius: "2px",
  };

  const cube2DContainer = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "10px",
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    backdropFilter: "blur(10px)",
  };

  const faceRow = {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  };

  const faceLabel = {
    width: "20px",
    textAlign: "center" as const,
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
  };

  return (
    <div style={cube2DContainer}>
      <h3 style={{ color: "white", margin: "0 0 10px 0" }}>2D Cube View</h3>

      {/* Up face */}
      <div style={faceRow}>
        <div style={faceLabel}>U</div>
        <div style={faceStyle}>
          {cube.faces.U.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`U-${rowIndex}-${colIndex}`}
                style={{
                  ...cellStyle,
                  backgroundColor: color,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Middle row: Left, Front, Right, Back */}
      <div style={faceRow}>
        <div style={faceLabel}>L</div>
        <div style={faceStyle}>
          {cube.faces.L.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`L-${rowIndex}-${colIndex}`}
                style={{
                  ...cellStyle,
                  backgroundColor: color,
                }}
              />
            ))
          )}
        </div>

        <div style={faceLabel}>F</div>
        <div style={faceStyle}>
          {cube.faces.F.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`F-${rowIndex}-${colIndex}`}
                style={{
                  ...cellStyle,
                  backgroundColor: color,
                }}
              />
            ))
          )}
        </div>

        <div style={faceLabel}>R</div>
        <div style={faceStyle}>
          {cube.faces.R.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`R-${rowIndex}-${colIndex}`}
                style={{
                  ...cellStyle,
                  backgroundColor: color,
                }}
              />
            ))
          )}
        </div>

        <div style={faceLabel}>B</div>
        <div style={faceStyle}>
          {cube.faces.B.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`B-${rowIndex}-${colIndex}`}
                style={{
                  ...cellStyle,
                  backgroundColor: color,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Down face */}
      <div style={faceRow}>
        <div style={faceLabel}>D</div>
        <div style={faceStyle}>
          {cube.faces.D.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`D-${rowIndex}-${colIndex}`}
                style={{
                  ...cellStyle,
                  backgroundColor: color,
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
