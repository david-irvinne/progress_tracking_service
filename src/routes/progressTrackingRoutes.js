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

// get activity recommendation by user
router.get("/recommendation/:userId", async (req, res)=>{
  const userId = req.params.userId;
  try { 
    const recommendationPipeline = [
      // filter log berdasarkan userId dan score tidak null
      {
        $match: {
          userId: userId, 
          score: {$ne: null, $exists: true}
        }
      },

      // kelompokkan berdasarkan activityName, hitung total skor dan jumlah kemunculan
      {
        $group: {
          _id: "$activityName",
          totalScore: {$sum: "$score"},
          count: {$sum: 1}
        }
      },

      // hitung rata-rata skor untuk tiap aktivitas
      {
        $project: {
          activityName: "$_id",
          averageScore: {$divide: ["$totalScore", "$count"]}
        }
      },
      // urutkan berdasarkan rata-rata skor terendah
      {
        $sort: {averageScore: 1}
      },
      // ambil satu hasil teratas
      {
        $limit: 1
      }
    ];

    const result = await ActivityLog.aggregate(recommendationPipeline);

    if(result.length === 0){
      return res.status(404).json({message: "no scorable activity for this user"});
    }

    res.status(200).json({
      message: "activity recommendation based on lowest average score.",
      activityName: result[0].activityName,
      averageScore: result[0].averageScore,
      numberOfAttemps: result[0].count
    })

  } catch (error) {
    console.log("error in getting activity recommendation:", error);
    res.status(500).json({message: "error in getting activity recommendation:", error:error.message});
  }
})

export default router;