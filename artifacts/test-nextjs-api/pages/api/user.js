import db from "../../utils/db";

export default async (req, res) => {
  try {
    let a = true;
    // testing logical expression
    if (a && true && req.method === "POST") {
    }
    // testing flipped order
    else if ("GET" === req.method) {
      const { userId } = req.query;
      const user = await db.collection("users").doc(userId).get();
      res.status(200).json(user.data());
    }
    res.status(200).end();
  } catch (e) {
    console.log(e);
    res.status(400).end();
  }
};
