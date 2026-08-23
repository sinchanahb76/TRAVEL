import express from "express";
import path from "path";
import fs from "fs";
import {
  handleGenerateItinerary,
  getTripsHandler,
  saveTripHandler,
  deleteTripHandler,
  getWeatherHandler,
  searchFlights,
  parseNaturalLanguageTransportQuery,
  getTransportRecommendations,
} from "./api/_lib/backendLogic.js";

const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

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

// API Route: Saved Trips Handlers
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

// API Route: Real-time Flight Search
app.post("/api/flights/search", async (req, res) => {
  try {
    const data = await searchFlights(req.body);
    return res.json(data);
  } catch (error: any) {
    console.error("Error searching flights:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to search flights",
    });
  }
});

// API Route: Natural Language Transport Parsing with Gemini
app.post("/api/transport/ai-parse", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    const data = await parseNaturalLanguageTransportQuery(prompt || "");
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Error parsing transport prompt:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to parse transport prompt",
    });
  }
});

// API Route: Transport Recommendations for Destinations
app.get("/api/transport/recommend", async (req, res) => {
  try {
    const destination = (req.query.destination as string) || "";
    const origin = (req.query.origin as string) || "";
    const data = await getTransportRecommendations(destination, origin);
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Error fetching transport recommendations:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch transport recommendations",
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

// Catch-all for undefined API routes to prevent serving HTML for API calls
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: "API endpoint not found" });
});

// Start Express and Vite middleware
async function startServer() {
  const distCandidates = [
    path.join(process.cwd(), "dist"),
    currentDir,
    path.join(currentDir, "dist"),
  ];
  let distPath = distCandidates[0];
  for (const candidate of distCandidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      distPath = candidate;
      break;
    }
  }

  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (viteError) {
      console.warn("Vite dev middleware failed to load, falling back to static files:", viteError);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(200).send("AI Travel Planner is running.");
        }
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send("AI Travel Planner is running.");
      }
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error("Server error on port", PORT, ":", err);
  });
}

startServer().catch((err) => {
  console.error("Critical failure during startServer:", err);
});

export default app;
