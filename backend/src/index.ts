import express from "express";
import cors from "cors";
import {
  changeStatus,
  getAll,
  addAnn,
  addComments,
  getComments,
  addReaction,
  deleteReaction,
  getReactions, // Add this import
} from "./announcementstore";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://interview-gamma-six.vercel.app"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Announcement routes
app.get("/all", getAll);
app.post("/add", addAnn);
app.patch("/change/:id", changeStatus);

// Comment routes
app.get("/announcements/:id/comments", getComments);
app.post("/announcements/:id/comments", addComments);

// Reaction routes
app.get("/announcements/:id/reactions", getReactions);
app.post("/announcements/:id/reactions", addReaction);
app.delete("/announcements/:id/reactions", deleteReaction);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
