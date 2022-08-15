import db from "../../../utils/db";
import { firestore } from "firebase-admin";

export default async (req, res) => {
  try {
    if (req.method === "POST") {
      const { roomId, user } = req.body;
      console.log(roomId, user);
      const { id } = await db
        .collection("rooms")
        .doc(roomId)
        .update({
          members: firestore.FieldValue.arrayUnion(user),
        });
      res.status(200).json({ id });
    }
    res.status(200).end();
  } catch (e) {
    console.log(e);
    res.status(400).end();
  }
};
