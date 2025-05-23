import express from "express"
import "dotenv/config"

const PORT = process.env.PORT || 5000;
const app = express();

app.get("/", async (req, res) => {
  const name = req.query.name;
  if(name){
    res.send("hello "+name);
  }
  else {
    res.send("hello there!")
  }
})

app.listen(PORT, () => {
  console.log("server running on port", PORT);
})


///