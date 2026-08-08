import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  handleGenerateItinerary,
  getTripsHandler,
  saveTripHandler,
  deleteTripHandler,
  getWeatherHandler,
} from "./api/_lib/backendLogic.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// API Route: Generate Itinerary using Gemini
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const data = await handleGenerateItinerary(req.body);
    return res.json(data);
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate itinerary",
    });
  }
});

// API Route: Weather Forecast Proxy
app.get("/api/weather", async (req, res) => {
  try {
    const destination = (req.query.destination as string) || "";
    const data = await getWeatherHandler(destination);
    return res.json(data);
  } catch (error: any) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch weather forecast",
    });
  }
});

// API Routes for Saved Trips
app.get("/api/trips", async (req, res) => {
  try {
    const data = await getTripsHandler();
    return res.json(data);
  } catch (error: any) {
    console.error("Error getting trips:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch saved trips",
    });
  }
});

app.post("/api/trips", async (req, res) => {
  try {
    const data = await saveTripHandler(req.body);
    return res.json(data);
  } catch (error: any) {
    console.error("Error saving trip:", error);
    return res.status(400).json({
      success: false,
      error: error?.message || "Invalid trip payload",
    });
  }
});

app.delete("/api/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteTripHandler(id);
    return res.json(data);
  } catch (error: any) {
    console.error("Error deleting trip:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to delete trip",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start Express and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
