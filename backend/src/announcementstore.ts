import { Request, Response } from "express";
export interface announcement {
  id: string;
  title: string;
  description?: String;
  status: "active" | "closed";
  comments?: Comment[];
  reactions?: "up" | "down" | "heart";
  createdAt: Date;
}

export interface Comment {
  author: string;
  text: string;
  createdAt: Date;
}

export const allann: announcement[] = [];

export async function getAll(req: Request, res: Response) {
  try {
    console.log(
      "This is the backend router returning all the announcements of the user notice board "
    );
    const sortedAnnouncements = [...allann].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    console.log(sortedAnnouncements);

    return res.status(200).json({
      announcements: sortedAnnouncements,
      success: true,
      count: sortedAnnouncements.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occured ",
      error: error,
    });
  }
}

export async function addAnn(req: Request, res: Response) {
  try {
    const { id, title, description, status } = req.body;

    if (!title) {
      return res.json({
        message: "Please enter teh title to continue adding",
      });
    }

    const newAnn: announcement = {
      id: id,
      title: title,
      description: description,
      status: "active",
      createdAt: new Date(),
    };

    allann.push(newAnn);
    console.log("added announcement", newAnn);

    return res.status(201).json({
      message: "Announcement added successfully",
      announcement: newAnn,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error,
    });
  }
}

export async function changeStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const announcement = allann.find((c) => c.id === id);

    if (!announcement) {
      return res
        .status(404)
        .json({ message: `Announcement with id ${id} not found` });
    }
    announcement.status = "closed";
    console.log("changed status of the ", id);
    return res.json({
      message: ` the announecemt with the id ${id} and status changes to the ${announcement?.status}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error,
    });
  }
}

export async function addComments(req: Request, res: Response) {
  try {
    const { authorname, text } = req.body;
    const { id } = req.params;
    if (!authorname) {
      return res.json({
        message: "Please enter the uthorname to add",
      });
    }

    const announcement = allann.find((c) => c.id === id);
    if (!announcement) {
      return res.status(404).json({
        message: `Announcement with id ${id} not found`,
      });
    }

    const newComment = {
      author: authorname,
      text: text,
      createdAt: new Date(),
    };

    if (!announcement.comments) {
      announcement.comments = [];
    }
    announcement.comments.push(newComment);

    console.log("Added comment:", newComment);

    return res.status(201).json({
      message: "Comment added successfully",
      announcement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error,
    });
  }
}

export async function getComments(req: Request, res: Response) {
  try {
    const { limit } = req.query;
    const { id } = req.params;
    if (!limit) {
      return res.status(201).json({
        message: "Enter the limit ",
      });
    }
    const announcement = allann.find((c) => c.id === id);
    const newlimit = parseInt(limit as string, 10);

    const comments = announcement?.comments?.slice(0, newlimit);

    return res.json({
      comments: comments,
      success: true,
    });
  } catch (error) {}
}
