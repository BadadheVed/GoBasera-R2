import express from "express";
import cors from "cors";
import { changeStatus, getAll, addAnn, addComments } from "./announcementstore";
import { getComments } from "./announcementstore";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://interview-gamma-six.vercel.app"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true, // if you need cookies/auth
  })
);

app.use(express.json());

app.get("/all", getAll);
app.post("/add", addAnn);
app.patch("/change/:id", changeStatus);
app.get("/announcements/:id/comments?limit", getComments); // function to get paginated commens
app.post("/announcements/:id/comments", addComments); // function to add the comments

app.listen(PORT, () => {
  console.log(`Listening on the port ${PORT}`);
});
