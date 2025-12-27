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
  Maximize2,
  Minimize2,
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
  const [originalIssue, setOriginalIssue] = useState(null);

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
  useEffect(() => {
    if (modalIssue) {
      const snapshot = {
        name: modalIssue.name || "",
        priority: modalIssue.priority || "",
        start_date: modalIssue.start_date || "",
        target_date: modalIssue.target_date || "",
        story_points: modalIssue.story_points || "",
        status: modalIssue.status || "",
        assignee_id: modalIssue.assignee_id || "",
      };

      setIssueForm(snapshot);
      setOriginalIssue(snapshot); // 🔥 BACKUP
      setEditedTitle(modalIssue.name);
    }
  }, [modalIssue]);

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [issueForm, setIssueForm] = useState({});

  useEffect(() => {
    if (modalIssue) {
      setIssueForm({
        name: modalIssue.name || "",
        priority: modalIssue.priority || "",
        start_date: modalIssue.start_date || "",
        target_date: modalIssue.target_date || "",
        story_points: modalIssue.story_points || "",
        status: modalIssue.status || "",
        assignee_id: modalIssue.assignee_id || "",
      });
      setEditedTitle(modalIssue.name);
    }
  }, [modalIssue]);

  const handleUpdate = async (field, value) => {
    try {
      const payload = { [field]: value };

      // optimistic UI
      setIssueForm((prev) => ({ ...prev, [field]: value }));
      setModalIssue((prev) => ({ ...prev, [field]: value }));

      await updateIssue(modalIssue.id, payload);

      toast.success("Issue updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update issue");
    }
  };

  const handleTitleSave = async () => {
    if (editedTitle === modalIssue.name) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateIssue(modalIssue.id, { name: editedTitle });

      setModalIssue((prev) => ({ ...prev, name: editedTitle }));
      setIssueForm((prev) => ({ ...prev, name: editedTitle }));

      toast.success("Title updated");
    } catch (err) {
      toast.error("Failed to update title");
    }

    setIsEditingTitle(false);
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

    if (!window.confirm("Move selected issues to Trash?")) return;

    try {
      await Promise.all(
        selectedIssues.map(
          (id) => deleteIssues(id) // 🔥 soft delete only
        )
      );

      toast.success("Issues moved to Trash");
      setSelectedIssues([]);

      // 🔥 refresh backlog
      // fetchIssues();
    } catch (err) {
      console.error(err);
      toast.error("Failed to move issues to Trash");
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Fullscreen not supported");
    }
  };
  const handleSaveIssue = async () => {
    const ok = window.confirm("Do you want to save changes?");
    if (!ok) return;

    try {
      await updateIssue(modalIssue.id, issueForm);

      setModalIssue((prev) => ({ ...prev, ...issueForm }));
      setOriginalIssue(issueForm); // new state becomes baseline

      toast.success("Issue updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save issue");
    }
  };

  const handleRestoreIssue = () => {
    if (!originalIssue) return;

    setIssueForm(originalIssue);
    setModalIssue((prev) => ({ ...prev, ...originalIssue }));

    toast("Changes restored", { icon: "↩️" });
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
          onClick={() => navigate(`/projects/${project.id}/backlog-bin`)}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:scale-104 transition rounded bg-white"
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
          onClick={toggleFullscreen}
          className="text-blue-400 hover:bg-gray-300 cursor-pointer h-fit px-2 py-2 rounded"
          title="Fullscreen Mode"
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
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
                    {issue.type === "story" && issue.story_points && (
                      <span className="ml-2 text-xs text-green-600">
                        (Story_Points : {issue.story_points})
                      </span>
                    )}
                  </td>
                  {/* ASSIGNED TO */}
                  <td className="px-3 py-2">
                    {getUserName(issue.assignee_id)} {/* <-- use assignee_id */}
                  </td>
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No issues found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
       

       {/* modal ah inga paste pannaum da */}

       
</div>
        {/* ================= ASSIGN SPRINT ================= */}
      
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
