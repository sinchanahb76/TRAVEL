import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTripsHandler, saveTripHandler, deleteTripHandler } from "./_lib/backendLogic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    if (req.method === "GET") {
      const data = await getTripsHandler();
      return res.status(200).json(data);
    } else if (req.method === "POST") {
      const data = await saveTripHandler(req.body);
      return res.status(200).json(data);
    } else if (req.method === "DELETE") {
      const id = (req.query.id as string) || (req.body?.id as string);
      if (!id) {
        return res.status(400).json({ success: false, error: "Trip ID is required" });
      }
      const data = await deleteTripHandler(id);
      return res.status(200).json(data);
    } else {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Vercel API trips error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Server error handling trips",
    });
  }
}
