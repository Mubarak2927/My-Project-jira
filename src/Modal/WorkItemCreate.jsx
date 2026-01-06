import React, { useEffect, useState } from "react";
import {
  X,
  Crown,
  CheckSquare,
  Bug,
  BookOpen,
  Layers,
  RotateCcw,
  Undo,
  Undo2,
} from "lucide-react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  createEpic,
  getEpic,
  createIssues,
  epicComments,
  getEpicComments,
  IssueComments,
  getIssueComments,
  getAllUsers,
  createsFeature,
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
     className=" w-full  px-3 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
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
    sprint_id: "", // new
    parent_id: "", // new
    estimated_hours: "", // new
    feature_id: "", // new
    tags: [], // new
    location: "backlog", // default
  });

  /* ================= COMMENTS STATE ================= */
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Store original form and comments for restore
  const [originalForm] = useState(structuredClone(form)); // store initial form
  const [originalComments] = useState(structuredClone(comments)); // store initial comments
  

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

    } else if (type === "feature") {
      await createsFeature({
        name: form.name,
        description: form.description,
        project_id: project.id,
        priority: form.priority || null,
        assignee_id: form.assignee || null,
      });

      toast.success("Feature Created");

    } else {
      await createIssues({
        name: form.name,
        description: form.description,
        epic_id: form.epic_id || null,
        priority: form.priority || null,
        assignee_id: form.assignee || null,
        type,
        story_points: type === "story" ? form.story_points : null,
        project_id: project.id,
        sprint_id: form.sprint_id || null,
        parent_id: form.parent_id || null,
        estimated_hours: form.estimated_hours || null,
        feature_id: form.feature_id || null,
        location: form.location,
        tags: form.tags,
        comments,
      });

      toast.success(`${type} Created`);
    }

    navigate(-1, { state: { refreshBacklog: true } });
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};

  const handleRestoreIssue = () => {
    if (!window.confirm("Undo all changes?")) return;

    setForm(structuredClone(originalForm));
    setComments(structuredClone(originalComments)); // restore comments
    setNewComment(""); // clear the new comment input if any

    toast("Changes restored", { icon: "↩️" });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/70 z-50 flex h-screen justify-center items-center pt-6">
<div
  className={`bg-gray-200 rounded-lg shadow-xl overflow-hidden 
    ${type === "epic" ? "w-[60vw] h-[40vh]" : "w-[90vw] h-[65vh]"}`}
>

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center px-5 py-3 ">
          <div className="flex items-center gap-2">
            {React.createElement(TYPE_ICON[type] || CheckSquare, {
              size: 28,
              className: "text-orange-500",
            })}
            <span className="font-semibold text-2xl text-blue-600 uppercase">
              {type}
            </span>
          </div>

          <div className=" px-6 py-3 flex justify-end gap-3">
            <button
              onClick={handleRestoreIssue}
              className="hover:scale-110 cursor-pointer transition"
              title="undo"
            >
              <Undo2 />
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-1 bg-blue-600 cursor-pointer text-white rounded-xs"
              title="Save"
            >
              Save
            </button>
            <button title="Close" onClick={() => navigate(-1)}>
              <X className="text-red-600 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 grid grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          {/* LEFT */}
          <div className="col-span-2 space-y-4">
            <Input
              className="outline-none"
              placeholder={type === "epic" ? "Epic Name" : "Title"}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
             className="w-full h-[30vh] px-3 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
            />

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
                  className="w-full px-3 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
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
                  className="w-full px-3 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>
              {type === "story" && (
                <div>
                  <p className="text-gray-500 mb-1">Story Points</p>
                  <select
                    className="w-full px-3 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
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
              <div>
                <p className="text-gray-500 mb-1">Estimated Hours</p>
                <input
                  type="number"
                  className="w-full px-3 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
                  value={form.estimated_hours}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, estimated_hours: e.target.value }))
                  }
                  placeholder="Enter estimated hours"
                />
              </div>

              <div>
                <p className="text-gray-500 mb-1">Assign To</p>
                <select
                  className="w-full px-3 py-3  rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
                  value={form.assignee}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      assignee: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select Employee
                  </option>
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
      </div>
    </div>
  );
};

export default WorkItemCreate;
