import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store room states in memory (use Redis for production)
const rooms = new Map();

// Middleware
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  // Serve index.html for all routes (SPA support)
  app.get('*', (req, res, next) => {
    // Skip API routes and health check
    if (req.path.startsWith('/health') || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (room) {
    res.json({
      roomId,
      userCount: room.users.size,
      language: room.language
    });
  } else {
    res.status(404).json({ error: "Room not found" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, userId, username }) => {
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: "// Welcome to the collaborative coding interview!\n// Start coding in JavaScript...\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n",
        language: "javascript",
        users: new Map()
      });
      console.log(`Created new room: ${roomId}`);
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, { userId, username });

    // Send current room state to new user
    socket.emit("room-state", {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values())
    });

    // Notify others
    socket.to(roomId).emit("user-joined", { userId, username });

    console.log(`User ${username} (${userId}) joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
      socket.to(roomId).emit("code-update", { code });
    }
  });

  socket.on("cursor-position", ({ roomId, position }) => {
    socket.to(roomId).emit("cursor-update", {
      userId: socket.id,
      position
    });
  });

  socket.on("language-change", ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;

      // Provide starter code for the new language
      const starterCode = {
        javascript: "// Welcome to the collaborative coding interview!\n// Start coding in JavaScript...\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n",
        python: "# Welcome to the collaborative coding interview!\n# Start coding in Python...\n\ndef greet(name):\n    return f'Hello, {name}!'\n"
      };

      room.code = starterCode[language] || starterCode.javascript;

      // Emit updates to all users in the room (including sender)
      io.to(roomId).emit("language-update", { language });
      io.to(roomId).emit("code-update", { code: room.code });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        io.to(roomId).emit("user-left", { userId: user.userId });

        console.log(`User ${user.username} left room ${roomId}`);

        // Clean up empty rooms after 5 minutes
        if (room.users.size === 0) {
          setTimeout(() => {
            if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
              rooms.delete(roomId);
              console.log(`Deleted empty room: ${roomId}`);
            }
          }, 5 * 60 * 1000);
        }
      }
    });
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
