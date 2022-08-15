import db from "../../../utils/db";
import { firestore } from "firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      const { roomId, user, testVar } = req.body;
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
