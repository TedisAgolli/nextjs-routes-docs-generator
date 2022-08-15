import db from "../../utils/db";

export default async (req, res) => {
  try {
    if (req.method === "POST") {
      const { roomId, createdBy } = req.body;
      const { id } = await dbroutes.collection("rooms").doc(roomId).create({
        createdBy,
        members: [],
        createdAt: new Date().toISOString(),
      });
      res.status(200).json({ id });
    } else if (req.method === "GET") {
      const { roomId } = req.query;
      const doc = await db.collection("rooms").doc(roomId).get();
      if (!doc.exists) {
        res.status(404).end();
      } else {
        res.status(200).json(doc.data());
      }
    } else if (req.method === "DELETE") {
      const { roomId } = req.query;
      await db.collection("entries").doc(roomId).delete();
    }
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
};
