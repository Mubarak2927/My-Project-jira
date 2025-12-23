import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  BookOpen,
  Bug,
  Plus,
  Dot,
  Trash2,
  SquarePen,
  Eye,
  X,
  Crown,
  Layers,     // Feature
  User, 
  List,
  ListFilter,
  Fullscreen
} from "lucide-react";
import {
  deleteIssues,
  getIssueComments,
  getSprint,
  IssueComments,
  sprintTaskMove,
  updateIssue,
} from "../API/projectAPI";
import { useOutletContext } from "react-router";
import toast, { Toaster } from "react-hot-toast";

const Backlog = ({
  epics = [],
  selectedEpic,
  issues = [],
  form,
  setForm,
  handleAdd,
  loading,
  handleAssignSprint,
  setSelectedIssues,
  selectedIssues,
  handleUpdateIssue,
  handleAddComment,
  openIssueModal,
  handleDeleteIssue,
  openEditModal,
  modalIssue,
  editIssue,
  issueComments,
  newComment,
  setNewComment,
  setModalIssue,
  editForm,
  setEditIssue,
  setEditForm,
}) => {
  const filteredIssues = issues.filter((issue) => {
    // 🔥 Sprint assign pannina task backlog la varakoodathu
    if (issue.sprint_id) return false;

    // 🔥 Epic filter
    if (selectedEpic) {
      return issue.epic_id === selectedEpic.id;
    }

    return true;
  });

  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

  const typeIcon = {
    task: <CheckSquare size={14} className="text-blue-600" />,
    story: <BookOpen size={14} className="text-purple-600" />,
    bug: <Bug size={14} className="text-red-600" />,
  };

  /* ===================== STATE ===================== */
  const [sprints, setSprints] = useState([]);
  const { project } = useOutletContext();
  const [openWorkItem, setOpenWorkItem] = useState(false);


  /* ===================== TOGGLE ISSUE ===================== */
  const toggleIssue = (id) => {
    setSelectedIssues((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ===================== FETCH SPRINT ===================== */
  const fetchSprints = async () => {
    if (!project?.id) return;
    try {
      const res = await getSprint(project.id);
      setSprints(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [project]);

  /* ===================== PRIORITY COLORS ===================== */
  const priorityColors = {
    highest: "bg-red-200 text-red-800",
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
    lowest: "bg-blue-100 text-blue-700",
  };

  /* ===================== ASSIGN SPRINT ===================== */

  const getEpicName = (epicId) => {
    const epic = epics.find((e) => e.id === epicId);
    return epic ? epic.name : "No Epic";
  };

  return (
    <>
    <div className="flex justify-end gap-3 mt-3 mb-3">
       <button
      onClick={() => setOpenWorkItem(!openWorkItem)}
      className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:scale-104 transistion rounded shadow-sm hover:bg-gray-50"
    >
      <Plus size={16} />
      <span>New Work Item</span>
    </button>
    <button
      className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:scale-104 transistion rounded shadow-sm hover:bg-gray-50"
    
    >
      <Trash2 size={16}/>Recycle Bin
    </button>
    <button
      className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:scale-104 transistion rounded shadow-sm hover:bg-gray-50"
    >
      Bulk Upload
    </button>
      
      
          <button className=" text-blue-400 hover:bg-gray-300 h-fit px-2 py-2" title="View Options"><List /></button>
          <button className="text-blue-400 hover:bg-gray-300 h-fit px-2 py-2" title="List Filter"><ListFilter/></button>
          <button className=" text-blue-400 hover:bg-gray-300 h-fit px-2 py-2" title="Fullscreen Mode"><Fullscreen/></button>
        

    </div>
    <div className="rounded-xl p-3 bg-gray-100 shadow-md/40 w-full h-[73vh]">
      <Toaster position="top-right" />
      {/* ================= HEADER ================= */}
     <div className="flex justify-between items-center mb-4">
  <h2 className="font-semibold text-lg">Backlog</h2>

  {/* 🔥 New Work Item Dropdown */}
  <div className="relative">
   

    {openWorkItem && (
      <div className="absolute right-0 mt-1 w-52 bg-white rounded shadow-lg z-50">
        
        {/* Epic */}
        <div
          onClick={() => {
            setForm({ ...form, type: "epic" });
            setOpenWorkItem(false);
          }}
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <Crown size={16} className="text-orange-500" />
          <span>Epic</span>
        </div>

        {/* Feature */}
        <div
          onClick={() => {
            setForm({ ...form, type: "feature" });
            setOpenWorkItem(false);
          }}
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <Layers size={16} className="text-indigo-600" />
          <span>Feature</span>
        </div>

        {/* User Story */}
        <div
          onClick={() => {
            setForm({ ...form, type: "story" });
            setOpenWorkItem(false);
          }}
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <User size={16} className="text-purple-600" />
          <span>User Story</span>
        </div>

        {/* Task */}
        <div
          onClick={() => {
            setForm({ ...form, type: "task" });
            setOpenWorkItem(false);
          }}
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <CheckSquare size={16} className="text-blue-600" />
          <span>Task</span>
        </div>

        {/* Bug */}
        <div
          onClick={() => {
            setForm({ ...form, type: "bug" });
            setOpenWorkItem(false);
          }}
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <Bug size={16} className="text-red-600" />
          <span>Bug</span>
        </div>

      </div>
    )}
  </div>
</div>



      {/* ================= CREATE ISSUE ================= */}
      {/* <div className="shadow-sm/40 bg-gray-300 rounded-lg p-5 mb-4 space-y-2">
        <div className="flex gap-2">
          <select
            className="shadow-md bg-gray-100 outline-none rounded px-2 py-1"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="story">Story</option>
          </select>

          <input
            className="flex-1 shadow-md bg-gray-100 outline-none rounded px-2 py-1"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {form.type === "story" && (
            <select
              className="shadow-md bg-gray-100 outline-none rounded px-2 py-1"
              value={form.storyPoints}
              onChange={(e) =>
                setForm({
                  ...form,
                  storyPoints: e.target.value,
                })
              }
            >
              <option value="">Story Points</option>
              {storyPointsOptions.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
          )}

          <select
            className="shadow-md bg-gray-100 outline-none rounded px-2 py-1"
            value={form.epicId}
            onChange={(e) => setForm({ ...form, epicId: e.target.value })}
          >
            <option value="">No epic</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.name}
              </option>
            ))}
          </select>

          <select
            className="shadow-md bg-gray-100 outline-none rounded px-2 py-1"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="">Priority</option>
            <option value="highest">Highest</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>

        <input
          className="w-full shadow-md bg-gray-100 outline-none rounded px-2 py-1"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-white hover:bg-gray-200 flex items-center gap-1 cursor-pointer hover:scale-102 transition shadow-md/20 text-green-600 px-4 rounded"
        >
          <Plus size={15} />
          {loading ? "Adding" : "Add Task"}
        </button>
      </div> */}

      <p className="mt-2 mb-2 text-gray-400">Task Lists</p>

      {/* ================= ISSUE LIST ================= */}
      <div className="space-y-3 overflow-y-auto h-[30vh] pr-1">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-gray-300 rounded-xl p-3 shadow-sm flex items-start gap-2"
          >
            <input
              type="checkbox"
              className="mt-5"
              checked={selectedIssues.includes(issue.id)} // ✅ FIX
              onChange={() => toggleIssue(issue.id)} // ✅ FIX
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                {typeIcon[issue.type]}
                <p className="font-semibold text-gray-800 truncate">
                  {issue.name}
                  {issue.type === "story" && issue.story_points && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full text-green-600 font-medium">
                      Story_Points : {issue.story_points}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center  gap-2 mt-2 flex-wrap text-xs">
                {/* Epic Name */}
                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  {getEpicName(issue.epic_id)}
                </span>

                {/* Priority */}
                <span
                  className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                    priorityColors[issue.priority] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {issue.priority}
                </span>

                {/* Story Points */}

                <span className="text-shadow-lg flex items-center   ">
                  <Dot size={20} className="text-white" /> {issue.status}
                </span>
              </div>
              <span className="text-sm"> {issue.description}</span>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="text-green-600"
                onClick={() => openIssueModal(issue)}
              >
                <Eye size={15} />
              </button>
              {modalIssue && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg w-[500px] max-h-[80vh] overflow-y-auto p-5 relative">
                    <button
                      onClick={() => setModalIssue(null)}
                      className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                    >
                      <X size={20} />
                    </button>

                    <h2 className="font-semibold text-lg mb-2">
                      Task Name : {modalIssue.name}
                    </h2>
                    <p className="mb-2 text-sm ">
                      Description : {modalIssue.description}
                    </p>

                    <div className=" gap-2 mb-3">
                      <p className="px-2 py-0.5 rounded-full ">
                        Type : {modalIssue.type}
                      </p>
                      <p className="px-2 py-0.5 rounded-full ">
                        Priority : {modalIssue.priority}
                      </p>
                      {modalIssue.story_points && (
                        <p className="px-2 py-0.5 rounded-full bg-green-100">
                          Story Points: {modalIssue.story_points}
                        </p>
                      )}
                      <span className="px-2 py-0.5 rounded-full ">
                        Status : {modalIssue.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Comments</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {issueComments.length === 0 && (
                          <p className="text-gray-400 text-sm">
                            No comments yet.
                          </p>
                        )}
                        {issueComments.map((c) => (
                          <div key={c.id} className="p-2 bg-gray-100 rounded">
                            <p className="text-sm">{c.comment}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          className="flex-1 px-2 py-1 rounded border"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                          onClick={handleAddComment}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="text-blue-600"
                onClick={() => openEditModal(issue)}
              >
                <SquarePen size={15} />
              </button>
              {editIssue && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg w-[500px] max-h-[80vh] overflow-y-auto p-5 relative">
                    <button
                      onClick={() => setEditIssue(null)}
                      className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                    >
                      <X size={20} />
                    </button>

                    <h2 className="font-semibold text-lg mb-3">Edit Task</h2>

                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Title"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />

                      <textarea
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />

                      <select
                        className="w-full px-2 py-1 border rounded"
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, type: e.target.value })
                        }
                      >
                        <option value="task">Task</option>
                        <option value="story">Story</option>
                        <option value="bug">Bug</option>
                      </select>
                      {editForm.type === "story" && (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Story Points"
                          value={editForm.story_points}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              story_points: e.target.value,
                            })
                          }
                        />
                      )}

                      <select
                        className="w-full px-2 py-1 border rounded"
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value })
                        }
                      >
                        <option value="">Priority</option>
                        <option value="highest">Highest</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="lowest">Lowest</option>
                      </select>

                      <select
                        className="w-full px-2 py-1 border rounded"
                        value={editForm.epic_id}
                        onChange={(e) =>
                          setEditForm({ ...editForm, epic_id: e.target.value })
                        }
                      >
                        <option value="">No Epic</option>
                        {epics.map((epic) => (
                          <option key={epic.id} value={epic.id}>
                            {epic.name}
                          </option>
                        ))}
                      </select>

                      {editForm.type === "story" && (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Story Points"
                          value={editForm.story_points}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              story_points: e.target.value,
                            })
                          }
                        />
                      )}

                      <button
                        onClick={handleUpdateIssue}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="text-red-600"
                onClick={() => handleDeleteIssue(issue.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ASSIGN SPRINT ================= */}
      <div className="flex justify-between mt-5 items-center gap-3">
        <div>
          <span className="text-sm text-gray-500">
            Total Task : {filteredIssues.length} items
          </span>
        </div>
        <div className="flex gap-3">
          <select
            className="border px-2 py-1 rounded"
            value={form.sprintId}
            onChange={(e) => setForm({ ...form, sprintId: e.target.value })}
          >
            <option value="">Select Sprint</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignSprint}
            disabled={!form.sprintId || selectedIssues.length === 0}
            className={`border px-4 py-2 rounded text-white ${
              !form.sprintId || selectedIssues.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500"
            }`}
          >
            Assign Sprint
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Backlog;
