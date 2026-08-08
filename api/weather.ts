import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getWeatherHandler } from "./_lib/backendLogic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    const destination = (req.query.destination as string) || "";
    const data = await getWeatherHandler(destination);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Vercel API weather error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch weather forecast",
    });
  }
}
