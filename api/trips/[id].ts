import type { VercelRequest, VercelResponse } from "@vercel/node";
import { deleteTripHandler } from "../../src/server/backendLogic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    const { id } = req.query;
    const tripId = Array.isArray(id) ? id[0] : id;

    if (!tripId) {
      return res.status(400).json({ success: false, error: "Trip ID is required" });
    }

    if (req.method === "DELETE") {
      const data = await deleteTripHandler(tripId);
      return res.status(200).json(data);
    } else {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Vercel API trips/[id] error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Server error deleting trip",
    });
  }
}
