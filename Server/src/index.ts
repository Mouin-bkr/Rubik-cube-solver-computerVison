import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { cubeRoutes } from "./routes/cubeRoutes";
import { solvingRoutes } from "./routes/solvingRoutes";

const app = express();
const server = createServer(app);
// Allowed origins: from env (comma-separated) or default to localhost in dev
const corsEnv = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = corsEnv.split(",").map((s) => s.trim()).filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Routes
app.use("/api/cube", cubeRoutes);
app.use("/api/solving", solvingRoutes);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Handle solving progress updates
  socket.on("solving-progress", (data) => {
    socket.broadcast.emit("solving-update", data);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
});

// Optional health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cube-logic" });
});
