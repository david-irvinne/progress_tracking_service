import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("test from progress tracking")
});

export default router;