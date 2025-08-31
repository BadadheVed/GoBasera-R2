import { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: "active" | "closed";
  createdAt: string;
  comments?: Comment[];
  reactions?: Reaction[];
}

interface Comment {
  author: string;
  text: string;
  createdAt: string;
}

interface Reaction {
  userId: string;
  type: "up" | "down" | "heart";
  createdAt: string;
  idempotencyKey?: string;
}

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [id, setId] = useState(""); // for changing status
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [nextId, setNextId] = useState(0);

  // Comment states
  const [commentAnnId, setCommentAnnId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [getCommentsId, setGetCommentsId] = useState("");
  const [commentsLimit, setCommentsLimit] = useState("10");
  const [comments, setComments] = useState<Comment[]>([]);

  // Reaction states
  const [reactionAnnId, setReactionAnnId] = useState("");
  const [reactionType, setReactionType] = useState<"up" | "down" | "heart">(
    "up"
  );
  const [userId, setUserId] = useState("user123");
  const [getReactionsId, setGetReactionsId] = useState("");
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState({
    up: 0,
    down: 0,
    heart: 0,
    total: 0,
  });

  const handleAdd = async () => {
    const newId = nextId.toString();

    const response = await fetch("http://localhost:3000/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newId,
        title,
        description,
      }),
    });

    const data = await response.json();
    alert(
      `${data.message}\n\nAnnouncement ID: ${newId}\n(Copy this ID for testing comments/reactions)`
    );
    setNextId(nextId + 1);
    setTitle("");
    setDescription("");
  };

  const handleChangeStatus = async () => {
    const response = await fetch(`http://localhost:3000/change/${id}`, {
      method: "PATCH",
    });

    const data = await response.json();
    alert(data.message);
    setId("");
  };

  const handleGetAll = async () => {
    const response = await fetch("http://localhost:3000/all");
    const data = await response.json();
    setAnnouncements(data.announcements);
  };

  // Comment functions
  const handleAddComment = async () => {
    if (!commentAnnId || !authorName) {
      alert("Please enter announcement ID and author name");
      return;
    }

    const response = await fetch(
      `http://localhost:3000/announcements/${commentAnnId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorname: authorName,
          text: commentText,
        }),
      }
    );

    const data = await response.json();
    alert(data.message);
    setCommentAnnId("");
    setAuthorName("");
    setCommentText("");
  };

  const handleGetComments = async () => {
    if (!getCommentsId) {
      alert("Please enter announcement ID");
      return;
    }

    const response = await fetch(
      `http://localhost:3000/announcements/${getCommentsId}/comments?limit=${commentsLimit}`
    );
    const data = await response.json();

    if (data.success) {
      setComments(data.comments);
      alert(`Retrieved ${data.count} comments`);
    } else {
      alert(data.message);
    }
  };

  // Reaction functions
  const handleAddReaction = async () => {
    if (!reactionAnnId || !userId) {
      alert("Please enter announcement ID and user ID");
      return;
    }

    const idempotencyKey = `${userId}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const response = await fetch(
      `http://localhost:3000/announcements/${reactionAnnId}/reactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          type: reactionType,
        }),
      }
    );

    const data = await response.json();
    alert(data.message);
  };

  const handleDeleteReaction = async () => {
    if (!reactionAnnId || !userId) {
      alert("Please enter announcement ID and user ID");
      return;
    }

    const response = await fetch(
      `http://localhost:3000/announcements/${reactionAnnId}/reactions`,
      {
        method: "DELETE",
        headers: {
          "x-user-id": userId,
        },
      }
    );

    const data = await response.json();
    alert(data.message);
  };

  const handleGetReactions = async () => {
    if (!getReactionsId) {
      alert("Please enter announcement ID");
      return;
    }

    const response = await fetch(
      `http://localhost:3000/announcements/${getReactionsId}/reactions`
    );
    const data = await response.json();

    if (data.success) {
      setReactions(data.reactions);
      setReactionCounts(data.counts);
      alert(`Retrieved ${data.reactions.length} reactions`);
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      {/* Add Announcement Section */}
      <div
        style={{
          marginBottom: "3rem",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>Add Announcement</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <button onClick={handleAdd} style={{ padding: "0.5rem 1rem" }}>
          Add Announcement
        </button>
      </div>

      {/* Change Status Section */}
      <div
        style={{
          marginBottom: "3rem",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>Change Status</h2>
        <input
          placeholder="Announcement ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <button onClick={handleChangeStatus} style={{ padding: "0.5rem 1rem" }}>
          Close Announcement
        </button>
      </div>

      {/* Comments Section */}
      <div
        style={{
          marginBottom: "3rem",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>Comments</h2>

        <h3>Add Comment</h3>
        <input
          placeholder="Announcement ID"
          value={commentAnnId}
          onChange={(e) => setCommentAnnId(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <input
          placeholder="Author Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <textarea
          placeholder="Comment Text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
            height: "80px",
          }}
        />
        <button onClick={handleAddComment} style={{ padding: "0.5rem 1rem" }}>
          Add Comment
        </button>

        <h3>Get Comments</h3>
        <input
          placeholder="Announcement ID"
          value={getCommentsId}
          onChange={(e) => setGetCommentsId(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <input
          placeholder="Limit (number of comments)"
          value={commentsLimit}
          onChange={(e) => setCommentsLimit(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <button onClick={handleGetComments} style={{ padding: "0.5rem 1rem" }}>
          Get Comments
        </button>

        {comments.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Comments:</h4>
            <ul>
              {comments.map((comment, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#000000ff",
                  }}
                >
                  <strong>{comment.author}</strong>: {comment.text}
                  <br />
                  <small>{new Date(comment.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reactions Section */}
      <div
        style={{
          marginBottom: "3rem",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>Reactions</h2>

        <h3>Add/Update Reaction</h3>
        <input
          placeholder="Announcement ID"
          value={reactionAnnId}
          onChange={(e) => setReactionAnnId(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <select
          value={reactionType}
          onChange={(e) =>
            setReactionType(e.target.value as "up" | "down" | "heart")
          }
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        >
          <option value="up">👍 Up</option>
          <option value="down">👎 Down</option>
          <option value="heart">❤️ Heart</option>
        </select>
        <button
          onClick={handleAddReaction}
          style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
        >
          Add Reaction
        </button>
        <button
          onClick={handleDeleteReaction}
          style={{ padding: "0.5rem 1rem" }}
        >
          Delete My Reaction
        </button>

        <h3>Get Reactions</h3>
        <input
          placeholder="Announcement ID"
          value={getReactionsId}
          onChange={(e) => setGetReactionsId(e.target.value)}
          style={{
            display: "block",
            margin: "0.5rem 0",
            padding: "0.5rem",
            width: "100%",
          }}
        />
        <button onClick={handleGetReactions} style={{ padding: "0.5rem 1rem" }}>
          Get Reactions
        </button>

        {reactions.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Reaction Summary:</h4>
            <div
              style={{
                backgroundColor: "#050505ff",
                padding: "1rem",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              <p>
                👍 Up: {reactionCounts.up} | 👎 Down: {reactionCounts.down} | ❤️
                Heart: {reactionCounts.heart} | Total: {reactionCounts.total}
              </p>
            </div>

            <h4>Individual Reactions:</h4>
            <ul>
              {reactions.map((reaction, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#000000ff",
                  }}
                >
                  <strong>{reaction.userId}</strong> reacted with{" "}
                  {reaction.type === "up"
                    ? "👍"
                    : reaction.type === "down"
                    ? "👎"
                    : "❤️"}{" "}
                  {reaction.type}
                  <br />
                  <small>{new Date(reaction.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* All Announcements Section */}
      <div
        style={{
          marginBottom: "3rem",
          border: "1px solid #000000ff",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>All Announcements</h2>
        <button onClick={handleGetAll} style={{ padding: "0.5rem 1rem" }}>
          Get All Announcements
        </button>

        {announcements.length > 0 && (
          <ul style={{ marginTop: "1rem" }}>
            {announcements.map((ann) => (
              <li
                key={ann.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#000000ff",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>ID: {ann.id}</strong>
                  <button
                    onClick={() => navigator.clipboard.writeText(ann.id)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.2rem 0.5rem",
                      fontSize: "12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    title="Copy ID to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
                <strong>Title: {ann.title}</strong>
                <br />
                Description: {ann.description || "No description"}
                <br />
                Status:{" "}
                <span
                  style={{ color: ann.status === "active" ? "green" : "red" }}
                >
                  {ann.status}
                </span>
                <br />
                Created: {new Date(ann.createdAt).toLocaleString()}
                {ann.comments && ann.comments.length > 0 && (
                  <div>
                    <br />
                    Comments: {ann.comments.length}
                  </div>
                )}
                {ann.reactions && ann.reactions.length > 0 && (
                  <div>
                    <br />
                    Reactions: {ann.reactions.length}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
