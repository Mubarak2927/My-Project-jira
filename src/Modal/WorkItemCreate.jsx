import React, { useEffect, useState } from "react";
import {
  X,
  Crown,
  CheckSquare,
  Bug,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";
import {
  createEpic,
  getEpic,
  createIssues,
  epicComments,
  getEpicComments,
  IssueComments,
  getIssueComments,
  getAllUsers,
} from "../API/projectAPI";
import toast from "react-hot-toast";

/* ================= TYPE ICON MAP ================= */
const TYPE_ICON = {
  epic: Crown,
  task: CheckSquare,
  story: BookOpen,
  bug: Bug,
  feature: Layers,
};

/* ================= INPUT COMPONENT ================= */
const Input = React.memo(
  ({ placeholder, value, onChange, autoFocus = false }) => (
    <input
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border rounded p-2"
    />
  )
);

const WorkItemCreate = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { project } = useOutletContext();

  const [epics, setEpics] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    epic_id: "",
    priority: "",
    assignee: "",
    story_points: "",
  });

  /* ================= COMMENTS STATE ================= */
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

  /* ================= FETCH EPICS ================= */
  useEffect(() => {
    if (type !== "epic" && project?.id) {
      getEpic(project.id).then(setEpics).catch(console.error);
    }
  }, [type, project]);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // create page → initially empty
        setComments([]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [type]);
  const [users, setUsers] = useState([]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data); // API returns array of users
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  fetchUsers();
}, []);


  /* ================= ADD COMMENT ================= */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      if (type === "epic") {
        const res = await epicComments(project.id, newComment);
        setComments((prev) => [...prev, res.comment || newComment]);
      } else {
        // issue create → temp store
        setComments((prev) => [...prev, newComment]);
      }

      setNewComment("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };

  /* ================= SUBMIT ================= */
  // WorkItemCreate.jsx
const handleSave = async () => {
  try {
    if (!form.name.trim()) {
      toast.error("Title required");
      return;
    }

    if (type === "epic") {
      await createEpic({
        name: form.name,
        description: form.description,
        project_id: project.id,
      });
      toast.success("Epic Created");
    } else {
      await createIssues({
        name: form.name,
        description: form.description,
        epic_id: form.epic_id || null,
        priority: form.priority,
         assignee_id: form.assignee || null,
        type,
        story_points: type === "story" ? form.story_points : null,
        project_id: project.id,
        comments,
      });
      toast.success(`${type} Created`);
    }

    // 🔥 IMPORTANT
    navigate(-1, {
      state: { refreshBacklog: true },
    });

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};
;
  

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/70 z-50 flex h-screen justify-center items-center pt-6">
      <div className="bg-white w-[900px] max-w-[95%] max-h-[85vh] rounded-lg shadow-xl overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center px-5 py-3 ">
          <div className="flex items-center gap-2">
            {React.createElement(TYPE_ICON[type] || CheckSquare, {
              size: 18,
              className: "text-orange-500",
            })}
            <span className="font-semibold text-blue-600 uppercase">
              New {type}
            </span>
          </div>
          {/* <button onClick={() => navigate(-1)}>
            <X />
          </button> */}
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 grid grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">

          {/* LEFT */}
          <div className="col-span-2 space-y-4">
            <Input
              autoFocus
              placeholder={type === "epic" ? "Epic Name" : "Title"}
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full h-28 border rounded p-3"
            />

           {type === "story" && (
  <div>
    <p className="text-gray-500 mb-1">Story Points</p>
    <select
      className="border p-2 rounded w-full"
      value={form.story_points}
      onChange={(e) =>
        setForm((p) => ({
          ...p,
          story_points: e.target.value,
        }))
      }
    >
      <option value="">Select Story Points</option>
      {storyPointsOptions.map((sp) => (
        <option key={sp} value={sp}>
          {sp}
        </option>
      ))}
    </select>
  </div>
)}


            {/* COMMENTS */}
            {/* <div className="border rounded p-3 bg-gray-50">
              <p className="font-medium mb-2">
                Comments ({comments.length})
              </p> */}

              {/* <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No comments yet
                  </p>
                )}
                {comments.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded p-2 text-sm"
                  >
                    {c}
                  </div>
                ))}
              </div> */}

              {/* <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  className="flex-1 border rounded p-2"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-3 rounded"
                >
                  Add
                </button>
              </div> */}
            {/* </div> */}
          </div>

          {/* RIGHT */}
          {type !== "epic" && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Epic</p>
                <select
                  className="border p-2 rounded w-full"
                  value={form.epic_id}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      epic_id: e.target.value,
                    }))
                  }
                >
                  <option value="">No Epic</option>
                  {epics.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Priority</p>
                <select
                  className="border p-2 rounded w-full"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>

              <div>
  <p className="text-gray-500 mb-1">Assign To</p>
  <select
    className="border p-2  rounded w-full"
    value={form.assignee}
    onChange={(e) =>
      setForm((p) => ({
        ...p,
        assignee: e.target.value,
      }))
    }
  >
    <option value="" disabled>Select Employee</option>
    {users.map((u) => (
      <option key={u.id} value={u.id}>
        {u.full_name}
      </option>
    ))}
  </select>
</div>

            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className=" px-6 py-3 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkItemCreate;
