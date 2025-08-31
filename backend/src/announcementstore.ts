import { Request, Response } from "express";
export interface announcement {
  id: string;
  title: string;
  description?: String;
  status: "active" | "closed";
  comments?: Comment[];
  reactions?: Reaction[]
  createdAt: Date;
}

export interface Comment {
  author: string;
  text: string;
  createdAt: Date;
}

export interface Reaction {
  userId: string;
  type: "up" | "down" | "heart";
  createdAt: Date;
  idempotencyKey?: string;
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



// Reactions API 

const idempotencyCache: Map<string, number> = new Map();

// Clean expired keys every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of idempotencyCache.entries()) {
    if (expiry < now) {
      idempotencyCache.delete(key);
    }
  }
}, 60 * 1000);

// POST /announcements/:id/reactions
export async function addReaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.header("x-user-id");
    const idempotencyKey = req.header("Idempotency-Key");

    if (!userId) {
      return res.status(400).json({ message: "Missing x-user-id header" });
    }
    if (!["up", "down", "heart"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }
    if (!idempotencyKey) {
      return res.status(400).json({ message: "Missing Idempotency-Key header" });
    }

    const cacheKey = `${id}:${userId}:${idempotencyKey}`;
    const now = Date.now();

    // Check idempotency within 5 min
    if (idempotencyCache.has(cacheKey)) {
      return res.status(200).json({ message: "Duplicate request ignored" });
    }
    idempotencyCache.set(cacheKey, now + 5 * 60 * 1000);

    const announcement = allann.find((c) => c.id === id);
    if (!announcement) {
      return res.status(404).json({
        message: `Announcement with id ${id} not found`,
      });
    }

    if (!announcement.reactions) {
      announcement.reactions = [];
    }

    // Remove old reaction by this user (only one reaction per user)
    announcement.reactions = announcement.reactions.filter(
      (r) => r.userId !== userId
    );

    const newReaction: Reaction = {
      userId,
      type,
      createdAt: new Date(),
      idempotencyKey,
    };

    announcement.reactions.push(newReaction);

    console.log("Added reaction:", newReaction);

    return res.status(201).json({
      message: "Reaction added successfully",
      announcement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error,
    });
  }
}

// DELETE /announcements/:id/reactions
export async function deleteReaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.header("x-user-id");

    if (!userId) {
      return res.status(400).json({ message: "Missing x-user-id header" });
    }

    const announcement = allann.find((c) => c.id === id);
    if (!announcement) {
      return res.status(404).json({
        message: `Announcement with id ${id} not found`,
      });
    }

    const beforeCount = announcement.reactions?.length || 0;
    announcement.reactions = announcement.reactions?.filter(
      (r) => r.userId !== userId
    );

    if (announcement.reactions?.length === beforeCount) {
      return res.status(404).json({ message: "No reaction found for this user" });
    }

    console.log(`Removed reaction for user ${userId} on announcement ${id}`);

    return res.json({
      message: "Reaction removed successfully",
      announcement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error,
    });
  }
}