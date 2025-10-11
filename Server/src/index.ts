import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { cubeRoutes } from "./routes/cubeRoutes";
import { solvingRoutes } from "./routes/solvingRoutes";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
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
