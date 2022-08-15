import db from "../../../utils/db";

export default async (req, res) => {
  try {
    if (req.method === "POST") {
      const { roomId, roomName, roomSize } = req.body;
      const { id } = await db.collection("rooms").doc(roomId).update({
        roomName: roomName,
        roomSize: roomSize,
      });
      res.status(200).json({ id });
    }
    res.status(200).end();
  } catch (e) {
    console.log(e);
    res.status(400).end();
  }
};
