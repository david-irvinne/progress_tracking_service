import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  activityName : {
    type: String,
    required: true, 
    trim: true // hapus spasi di awal dan akhir
  },
  activityDuration: { // in minutes
    type: Number, 
    required: false
  },
  score: {
    type: Number,
    required: false,
  },
  comment: {
    type: String,
    required: false,
    trim: true
  }

}, {timestamps: true});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;




/*
id -> id aktivitas, dibuat dari mongodb otomatis
userId -> id user, tidak dibuat dari mongodb otomatis, karena akan mengambil id dari database lain
activityName -> nama aktivitas yang dilakukan
activityDuration -> berapa lama aktivitas ini dilakukan 
score -> skor  yang diperoleh user ketika melakukan aktivitas ini
comment -> komentar atau feedback yang diberikan AI
TimeStamp -> waktu kapan dilakukan

*/
