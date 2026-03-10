import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import fs from "fs";

const db = new Database("voltmap.db");
const upload = multer({ storage: multer.memoryStorage() });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    board_number TEXT NOT NULL,
    wall_position TEXT,
    height TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/buildings", (req, res) => {
    const buildings = db.prepare(`
      SELECT b.*, (SELECT COUNT(*) FROM floors f WHERE f.building_id = b.id) as floor_count 
      FROM buildings b 
      ORDER BY b.created_at DESC
    `).all();
    res.json(buildings);
  });

  app.post("/api/buildings", (req, res) => {
    const { name, address } = req.body;
    const result = db.prepare("INSERT INTO buildings (name, address) VALUES (?, ?)").run(name, address || "");
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/buildings/:id", (req, res) => {
    const { name, address } = req.body;
    db.prepare("UPDATE buildings SET name = ?, address = ? WHERE id = ?").run(name, address, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/buildings/:id", (req, res) => {
    db.prepare("DELETE FROM buildings WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/buildings/:id/floors", (req, res) => {
    const floors = db.prepare(`
      SELECT f.*, (SELECT COUNT(*) FROM rooms r WHERE r.floor_id = f.id) as room_count 
      FROM floors f 
      WHERE f.building_id = ?
    `).all(req.params.id);
    res.json(floors);
  });

  app.post("/api/buildings/:id/floors", (req, res) => {
    const { name } = req.body;
    const result = db.prepare("INSERT INTO floors (building_id, name) VALUES (?, ?)").run(req.params.id, name);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/floors/:id", (req, res) => {
    const { name } = req.body;
    db.prepare("UPDATE floors SET name = ? WHERE id = ?").run(name, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/floors/:id", (req, res) => {
    db.prepare("DELETE FROM floors WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/floors/:id/rooms", (req, res) => {
    const rooms = db.prepare(`
      SELECT r.*, (SELECT COUNT(*) FROM boards b WHERE b.room_id = r.id) as board_count 
      FROM rooms r 
      WHERE r.floor_id = ?
    `).all(req.params.id);
    res.json(rooms);
  });

  app.post("/api/floors/:id/rooms", (req, res) => {
    const { name, type, size } = req.body;
    const result = db.prepare("INSERT INTO rooms (floor_id, name, type, size) VALUES (?, ?, ?, ?)")
      .run(req.params.id, name, type, size);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/rooms/:id", (req, res) => {
    const { name, type, size } = req.body;
    db.prepare("UPDATE rooms SET name = ?, type = ?, size = ? WHERE id = ?")
      .run(name, type, size, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/rooms/:id", (req, res) => {
    db.prepare("DELETE FROM rooms WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/rooms/:id/boards", (req, res) => {
    const boards = db.prepare("SELECT * FROM boards WHERE room_id = ?").all(req.params.id);
    const boardsWithComponents = boards.map((board: any) => {
      const components = db.prepare("SELECT * FROM components WHERE board_id = ?").all(board.id);
      return { ...board, components };
    });
    res.json(boardsWithComponents);
  });

  app.post("/api/rooms/:id/boards", (req, res) => {
    const { board_number, wall_position, height, components } = req.body;
    const transaction = db.transaction(() => {
      const boardResult = db.prepare("INSERT INTO boards (room_id, board_number, wall_position, height) VALUES (?, ?, ?, ?)")
        .run(req.params.id, board_number, wall_position, height);
      const boardId = boardResult.lastInsertRowid;

      if (components && Array.isArray(components)) {
        const insertComp = db.prepare("INSERT INTO components (board_id, type, count) VALUES (?, ?, ?)");
        for (const comp of components) {
          insertComp.run(boardId, comp.type, comp.count);
        }
      }
      return boardId;
    });

    const boardId = transaction();
    res.json({ id: boardId });
  });

  app.put("/api/boards/:id", (req, res) => {
    const { board_number, wall_position, height, components } = req.body;
    const transaction = db.transaction(() => {
      db.prepare("UPDATE boards SET board_number = ?, wall_position = ?, height = ? WHERE id = ?")
        .run(board_number, wall_position, height, req.params.id);
      
      db.prepare("DELETE FROM components WHERE board_id = ?").run(req.params.id);

      if (components && Array.isArray(components)) {
        const insertComp = db.prepare("INSERT INTO components (board_id, type, count) VALUES (?, ?, ?)");
        for (const comp of components) {
          insertComp.run(req.params.id, comp.type, comp.count);
        }
      }
    });

    transaction();
    res.json({ success: true });
  });

  app.get("/api/floors/:id/report", (req, res) => {
    const floor = db.prepare(`
      SELECT f.*, b.name as building_name 
      FROM floors f 
      JOIN buildings b ON f.building_id = b.id 
      WHERE f.id = ?
    `).get(req.params.id) as any;

    if (!floor) return res.status(404).json({ error: "Floor not found" });

    const rooms = db.prepare("SELECT * FROM rooms WHERE floor_id = ?").all(req.params.id);
    const roomsData = rooms.map((room: any) => {
      const boards = db.prepare("SELECT * FROM boards WHERE room_id = ?").all(room.id);
      const boardsWithComponents = boards.map((board: any) => {
        const components = db.prepare("SELECT * FROM components WHERE board_id = ?").all(board.id);
        return { ...board, components };
      });
      return { ...room, boards: boardsWithComponents };
    });

    res.json({
      building_name: floor.building_name,
      floor_name: floor.name,
      rooms: roomsData
    });
  });

  app.delete("/api/boards/:id", (req, res) => {
    db.prepare("DELETE FROM boards WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // AI Detection Route
  app.post("/api/detect-components", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";

      const prompt = `Analyze this electrical board photo and count the number of components. 
      Identify and count the following specific component types:
      - 1_way_switch
      - 2_way_switch
      - bell_push_switch
      - 5a_socket
      - 15a_socket
      - fan_regulator
      - ac_switch
      - smart_wifi_switch
      - dimmer_switch
      
      Return the counts in a structured JSON format. Only include types that are actually detected.`;

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: req.file.buffer.toString("base64"),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              components: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { 
                      type: Type.STRING, 
                      description: "The type of component (1_way_switch, 2_way_switch, bell_push_switch, 5a_socket, 15a_socket, fan_regulator, ac_switch, smart_wifi_switch, dimmer_switch)" 
                    },
                    count: { type: Type.INTEGER, description: "The number of components of this type detected" }
                  },
                  required: ["type", "count"]
                }
              }
            },
            required: ["components"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("AI Detection Error:", error);
      res.status(500).json({ error: "AI Detection failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
