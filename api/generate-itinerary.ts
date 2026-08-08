import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleGenerateItinerary } from "./_lib/backendLogic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const data = await handleGenerateItinerary(req.body);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Vercel API generate-itinerary error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate itinerary",
    });
  }
}
