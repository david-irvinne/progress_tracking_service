import express from "express"
import "dotenv/config"
import progressTrackingRoutes from "./routes/progressTrackingRoutes.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use("/api/progress/", progressTrackingRoutes);

app.listen(PORT, () => {
  console.log("server running on port", PORT);
})
