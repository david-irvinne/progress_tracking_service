import express from "express";
import ActivityLog from "../models/activityLog.js";

const router = express.Router();

// create an activity
router.post("/activityLog", async (req, res) =>{
  try {
    const {userId, activityName, activityDuration, score, comment} = req.body;
    if(!userId || !activityName) return res.status(400).json({message: "please provide all fields"});

    // save to db
    const newActivity = new ActivityLog({
      userId, activityName, activityDuration, score, comment
    });

    await newActivity.save();
    res.status(201).json({message: "activity logged successfully!"});
  } catch (error) {
    console.log("error creating activity", error)
    res.status(500).json({message: "error logging activity:", error: error.message})
  }
})

// get an activity by user
router.get("/activityLog/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const logs = await ActivityLog.find({userId: userId}).sort({createdAt: -1});
    if(logs.length === 0){
      return res.status(404).json({message: "no activity logs found for this user"})
    }
    res.status(200).json(logs);

  } catch (error) {
    console.log("error fetching activity logs by user:", error);
    res.status(500).json({message: "error fetching activity logs", error: error.message});
  }
  
});

export default router;