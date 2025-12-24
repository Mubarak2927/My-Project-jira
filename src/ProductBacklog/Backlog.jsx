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
  Layers, // Feature
  User,
  List,
  ListFilter,
  Fullscreen,
  FileUp,
  Search,
  BookmarkCheck,
} from "lucide-react";
import {
  deleteIssues,
  getAllUsers,
  getIssueComments,
  getSprint,
  IssueComments,
  sprintTaskMove,
  updateIssue,
} from "../API/projectAPI";
import { useNavigate, useOutletContext } from "react-router";
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
  /* ===================== STATE FOR FILTERS ===================== */
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchAssignee, setSearchAssignee] = useState("");
  const [searchEpic, setSearchEpic] = useState("");

  /* ===================== FILTERED ISSUES ===================== */
  const filteredIssues = issues.filter((issue) => {
    // 🔥 Sprint assign pannina task backlog la varakoodathu
    if (issue.sprint_id) return false;

    // 🔥 Epic filter (dropdown)
    if (searchEpic && issue.epic_id !== searchEpic) return false;

    // 🔥 Type filter (dropdown)
    if (searchType && issue.type !== searchType) return false;

    // 🔥 Assigned user filter (dropdown)
    if (searchAssignee && issue.assignee_id !== searchAssignee) return false;

    // 🔥 Keyword filter (title, description)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const inTitle = issue.name.toLowerCase().includes(keyword);
      const inDesc = issue.description?.toLowerCase().includes(keyword);
      if (!inTitle && !inDesc) return false;
    }

    return true;
  });

  const navigate = useNavigate();

  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

  const typeIcon = {
    task: <CheckSquare size={14} className="text-blue-600" />,
    story: <BookOpen size={14} className="text-purple-600" />,
    bug: <Bug size={14} className="text-red-600" />,
    subtask: <BookmarkCheck size={14} className="text-orange-600" />,
  };

  /* ===================== STATE ===================== */
  const [sprints, setSprints] = useState([]);
  const { project } = useOutletContext();
  const [openWorkItem, setOpenWorkItem] = useState(false);
  const [users, setUsers] = useState([]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(modalIssue?.name);
  const [showParentModal, setShowParentModal] = useState(false);

  const handleTitleSave = () => {
    handleUpdate("name", editedTitle);
    setIsEditingTitle(false);
  };

  const handleUpdate = (field, value) => {
    // API call here da
    console.log(field, value);
  };

  const handleAddParent = (item) => {
    console.log("Parent added:", item);
    setShowParentModal(false);
  };

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers(); // API call
        setUsers(data); // store array of users
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

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

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.full_name : "Unassigned";
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.length === 0) {
      toast.error("Select at least one issue");
      return;
    }

    if (!window.confirm("Are you sure you want to delete selected issues?")) {
      return;
    }

    try {
      await Promise.all(selectedIssues.map((id) => deleteIssues(id)));

      toast.success("Selected issues deleted");

      // 🔥 selection clear pannanum
      setSelectedIssues([]);

      // 🔥 parent la issues refresh panra function irundha call pannunga
      // fetchIssues();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete issues");
    }
  };

  return (
    <>
      <div className="flex justify-end gap-3 mt-3 mb-3">
        <button
          onClick={() => setOpenWorkItem(!openWorkItem)}
          className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:scale-104 transistion rounded shadow-sm hover:bg-gray-100"
        >
          <Plus size={16} />
          <span className="text-blue-600">New Work Item</span>
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:scale-104 transition rounded shadow-sm hover:bg-gray-100"
          onClick={() => toast("Coming Soon!")}
        >
          <FileUp size={16} className="text-green-600" />
          <span>Upload File</span>
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 bg-white cursor-pointer hover:scale-104 transition rounded shadow-sm hover:bg-gray-100"
          onClick={() => toast("Coming Soon!")}
        >
          <Trash2 size={16} className="text-red-600" />
          <span className="text-red-600">Trash</span>
        </button>

        <button
          onClick={() => toast("Coming Soon!")}
          className=" text-blue-400 hover:bg-gray-300 h-fit px-2 py-2"
          title="View Options"
        >
          <List />
        </button>
        <button
          onClick={() => toast("Coming Soon!")}
          className="text-blue-400 hover:bg-gray-300 h-fit px-2 py-2"
          title="List Filter"
        >
          <ListFilter />
        </button>
        <button
          onClick={() => toast("Coming Soon!")}
          className=" text-blue-400 hover:bg-gray-300 h-fit px-2 py-2"
          title="Fullscreen Mode"
        >
          <Fullscreen />
        </button>
      </div>
      <div className="rounded-xl p-3 bg-gray-100 shadow-md/40 w-full h-[70vh]">
        <Toaster position="top-right" />
        {/* ================= HEADER SEARCH ================= */}
        <div className="items-center gap-2 flex">
          <div className="w-full flex bg-gray-200 items-center gap-1 justify-between  rounded-sm p-1">
            <div className="flex gap-2">
              <ListFilter className="text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Filter by keyword..."
                className="w-full  outline-none text-sm"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="text-gray-400 flex gap-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="task">Task</option>
                <option value="story">Story</option>
                <option value="bug">Bug</option>
                <option value="subtask">Subtask</option>
              </select>

              <select
                value={searchAssignee}
                onChange={(e) => setSearchAssignee(e.target.value)}
              >
                <option value="">Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>

              {/* <select
                value={searchEpic}
                onChange={(e) => setSearchEpic(e.target.value)}
              >
                <option value="">All Epics</option>
                {epics.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select> */}
            </div>
          </div>
        </div>
        <div className="relative">
          {openWorkItem && (
            <div className="absolute right-80 -mt-10 w-56 bg-white rounded-lg shadow-lg z-50 ">
              {/* EPIC */}
              <div
                onClick={() => {
                  setOpenWorkItem(false);
                  navigate(`/projects/${project.id}/work-items/new/epic`);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <Crown size={16} className="text-orange-500" />
                <span>Epic</span>
              </div>

              {/* TASK */}
              <div
                onClick={() => {
                  setOpenWorkItem(false);
                  navigate(`/projects/${project.id}/work-items/new/task`);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <CheckSquare size={16} className="text-blue-600" />
                <span>Task</span>
              </div>

              {/* USER STORY */}
              <div
                onClick={() => {
                  setOpenWorkItem(false);
                  navigate(`/projects/${project.id}/work-items/new/story`);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <User size={16} className="text-purple-600" />
                <span>User Story</span>
              </div>

              {/* BUG */}
              <div
                onClick={() => {
                  setOpenWorkItem(false);
                  navigate(`/projects/${project.id}/work-items/new/bug`);
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <Bug size={16} className="text-red-600" />
                <span>Bug</span>
              </div>
            </div>
          )}
        </div>

        <div className=" mt-2 mb-2 flex justify-between">
          <p className=" text-gray-400">Task Lists</p>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIssues.length === 0}
            className={`flex p-2 items-center gap-2 shadow-sm/50 rounded 
    ${
      selectedIssues.length === 0
        ? "text-gray-400 cursor-not-allowed"
        : "text-red-600 hover:bg-gray-200 hover:scale-105 cursor-pointer"
    }`}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>

        {/* ================= ISSUE TABLE ================= */}
        <div className="overflow-y-auto h-[49vh] rounded">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr className="text-gray-700">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Select Task</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Assigned to</th>

                {/* <th className="px-3 py-2">Actions</th> */}
              </tr>
            </thead>

            <tbody>
              {filteredIssues.map((issue, index) => (
                <tr
                  key={issue.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* SI NO */}
                  <td className="px-3 py-2">{index + 1}</td>

                  {/* CHECKBOX */}
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={() => toggleIssue(issue.id)}
                    />
                  </td>

                  {/* TYPE */}
                  <td className="px-3 py-2 flex items-center gap-1">
                    {typeIcon[issue.type]}
                    <span className="capitalize">{issue.type}</span>
                  </td>

                  {/* TITLE */}
                  <td className="px-3 py-2 font-medium">
                    <p
                      onClick={() => openIssueModal(issue)}
                      className=" hover:underline cursor-pointer w-fit"
                    >
                      {issue.name}
                    </p>
                  </td>
                  {/* ASSIGNED TO */}
                  <td className="px-3 py-2">
                    {getUserName(issue.assignee_id)} {/* <-- use assignee_id */}
                  </td>

                  {/* <td className="px-3 py-2 flex justify-center gap-3">
                    <button
                      className="text-red-600 "
                      onClick={() => handleDeleteIssue(issue.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td> */}
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">
                    No issues found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {modalIssue && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[85vw] h-[85vh] overflow-y-auto p-6 relative">
              {/* CLOSE */}
              <button
                onClick={() => setModalIssue(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>

              {/* ===== TITLE EDIT ===== */}
              <div className="mb-4">
                <p className="text-sm text-orange-600 font-semibold">
                  {modalIssue.type?.toUpperCase()}
                </p>

                {!isEditingTitle ? (
                  <h2
                    className="text-xl font-semibold cursor-pointer hover:bg-gray-100 inline-block px-1"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {modalIssue.name}
                  </h2>
                ) : (
                  <input
                    className="text-xl font-semibold border px-2 py-1 rounded w-full"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    autoFocus
                  />
                )}

                <p className="text-sm text-gray-500 mt-1">
                  Assigned to: {modalIssue.assignee_id || "No one selected"}
                </p>
              </div>

              {/* META */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <p className="capitalize">
                  <span className="font-medium">State:</span>{" "}
                  {modalIssue.status}
                </p>
              </div>

              {/* ===== MAIN ===== */}
              <div className="grid grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="col-span-2">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-700 mb-6">
                    {modalIssue.description || "No description"}
                  </p>

                  {/* COMMENTS */}
                  <h3 className="font-semibold mb-2">
                    Discussion ({issueComments.length})
                  </h3>

                  <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                    {issueComments.length === 0 && (
                      <p className="text-gray-400 text-sm">No comments yet</p>
                    )}
                    {issueComments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 bg-gray-100 flex justify-between rounded text-sm"
                      >
                        <p>{c.comment}</p>
                        <p>{c.author_name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white px-4 rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* RIGHT PANEL */}
                <div>
                  {/* PLANNING */}
                  <h3 className="font-semibold mb-3">Planning</h3>

                  {/* PRIORITY */}
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    className="w-full capitalize border rounded px-2 py-1 mb-3"
                    value={modalIssue.priority}
                    onChange={(e) => handleUpdate("priority", e.target.value)}
                  >
                    {["high", "highest", "medium", "low", "lowest"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  {/* DATES */}
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-2 py-1 mb-3"
                    value={modalIssue.start_date || ""}
                    onChange={(e) => handleUpdate("start_date", e.target.value)}
                  />

                  <label className="text-sm font-medium">Target Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-2 py-1 mb-4"
                    value={modalIssue.target_date || ""}
                    onChange={(e) =>
                      handleUpdate("target_date", e.target.value)
                    }
                  />

                  {/* STORY POINTS */}
                  <label className="text-sm font-medium">Story Points</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={modalIssue.story_points || ""}
                    onChange={(e) =>
                      handleUpdate("story_points", e.target.value)
                    }
                  >
                    <option value="">—</option>
                    {[0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>

                  {/* RELATED WORK */}
                  <h3 className="font-semibold mt-6 mb-2">Related Work</h3>
                  <button
                    className="text-blue-600 text-sm underline"
                    onClick={() => setShowParentModal(true)}
                  >
                    Add parent work item
                  </button>
                </div>
              </div>

              {/* ===== ADD PARENT MODAL ===== */}
              {/* {showParentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white w-[400px] rounded-lg p-4">
            <h3 className="font-semibold mb-3">Add Parent</h3>

            <label className="text-sm font-medium">Parent Type</label>
            <select className="w-full border rounded px-2 py-1 mb-3">
              <option>Epic</option>
              <option>Story</option>
              <option>Task</option>
            </select>

            <label className="text-sm font-medium">
              Select from Backlog
            </label>
            <div className="border rounded max-h-40 overflow-y-auto">
              {backlogItems.map(item => (
                <div
                  key={item.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleAddParent(item)}
                >
                  [{item.type}] {item.name}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowParentModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
            </div>
          </div>
        )}

        {/* ================= ASSIGN SPRINT ================= */}
      </div>
      <div className="flex justify-between  p-3 -mt-19 items-center gap-3">
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
    </>
  );
};

export default Backlog;
