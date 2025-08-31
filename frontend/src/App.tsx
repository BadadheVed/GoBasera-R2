import { useState } from "react";
import "./App.css";

interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: "active" | "closed";
  createdAt: string;
}

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [id, setId] = useState(""); // for changing status
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [nextId, setNextId] = useState(0); // start at 0

  const handleAdd = async () => {
    const newId = nextId.toString();

    const response = await fetch("https://interview-tsh7.onrender.com/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newId, // incrementing ID
        title,
        description,
      }),
    });

    const data = await response.json();
    alert(data.message);

    // increment nextId normally
    setNextId(nextId + 1);

    setTitle("");
    setDescription("");
  };

  const handleChangeStatus = async () => {
    const response = await fetch(
      `https://interview-tsh7.onrender.com/change/${id}`,
      {
        method: "PATCH",
      }
    );

    const data = await response.json();
    alert(data.message);
    setId("");
  };

  const handleGetAll = async () => {
    const response = await fetch("https://interview-tsh7.onrender.com/all");
    const data = await response.json();
    setAnnouncements(data.announcements);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Add Announcement</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleAdd}>Add Announcement</button>

      <h2>Change Status</h2>
      <input
        placeholder="Announcement ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={handleChangeStatus}>Close Announcement</button>

      <h2>All Announcements</h2>
      <button onClick={handleGetAll}>Get All</button>

      <ul>
        {announcements.map((ann) => (
          <li key={ann.id}>
            <strong>
              {ann.id} -{ann.title}
            </strong>{" "}
            - {ann.description || "No description"} - {ann.status} -{" "}
            {new Date(ann.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
