import React, { useEffect, useState } from "react";
import { CheckSquare, BookOpen, Bug, Plus, Dot, Trash2, SquarePen, Eye, X, Crown, Layers, User, List, ListFilter, Fullscreen, FileUp, Search, BookmarkCheck, Maximize2, Minimize2, Undo, SaveAll, RotateCcw, } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import {
  deleteIssues,
  getAllUsers,
  getSprint,
  getIssueComments,
  IssueComments,
  sprintTaskMove,
  updateIssue,
  getSingleIssues,
} from "../API/ProjectAPI";
import BacklogModal from "../Modal/BacklogModal";

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

  /* ===================== VIEW OPTIONS STATE ===================== */
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showHighestOnly, setShowHighestOnly] = useState(false);


  /* ===================== FILTERED ISSUES ===================== */
  const filteredIssues = issues.filter((issue) => {
  // 🔥 TASK ONLY
  if (issue.type !== "task" ) return false;

  if (issue.sprint_id) return false;

  if (showHighestOnly && issue.priority !== "highest") return false;

  if (searchEpic && issue.epic_id !== searchEpic) return false;

  if (searchType && issue.type !== searchType) return false;

  if (searchAssignee && issue.assignee_id !== searchAssignee) return false;

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

  const [showParentModal, setShowParentModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // const [modalIssue, setModalIssue] = useState(null);



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
    fetchUsers()
  }, []);

  // 🔥 ALL FILTERED TASK IDs
const allFilteredIds = filteredIssues.map((i) => i.id);

// 🔥 CHECK ALL SELECTED
const isAllSelected =
  allFilteredIds.length > 0 &&
  allFilteredIds.every((id) => selectedIssues.includes(id));

// 🔥 SELECT / UNSELECT ALL
const toggleSelectAll = () => {
  if (isAllSelected) {
    setSelectedIssues((prev) =>
      prev.filter((id) => !allFilteredIds.includes(id))
    );
  } else {
    setSelectedIssues((prev) => [
      ...new Set([...prev, ...allFilteredIds]),
    ]);
  }
};


  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      // check if response is the array or response.data is the array
      const userData = response.data || response;

      if (Array.isArray(userData)) {
        setUsers(userData);
      } else {
        console.error("Data is not an array:", userData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };
const openIssueSingleModal = async (issueId, indexNo) => {
  try {
    const issue = await getSingleIssues(issueId);

    setModalIssue({
      ...issue,
      tableIndex: indexNo, // 🔥 BACKLOG INDEX
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to load issue");
  }
};


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
          <span>Import File</span>
        </button>

        <button
          onClick={() => navigate(`/projects/${project.id}/backlog-bin`)}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:scale-104 transition rounded bg-white"
        >
          <Trash2 size={16} className="text-red-600" />
          <span className="text-red-600">Trash</span>
        </button>

        <button
          onClick={() => setShowViewOptions(!showViewOptions)}
          className="text-blue-400 hover:bg-gray-300 h-fit px-2 py-2 relative"
          title="View Options"
        >
          <List />
        </button>
        {showViewOptions && (
          <div className="absolute right-10 top-66 bg-white rounded-lg shadow-lg p-3 z-50">


            {/* PRIORITY TOGGLE */}
            <div className="flex items-center gap-5">
              <span className="text-sm text-gray-700">
                Highest Priority
              </span>

              <button
                onClick={() => setShowHighestOnly(!showHighestOnly)}
                className={`w-10 h-5 flex items-center cursor-pointer rounded-full p-1 transition ${showHighestOnly ? "bg-green-500" : "bg-gray-300"
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition ${showHighestOnly ? "translate-x-5" : ""
                    }`}
                />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowFilterBar(!showFilterBar)}
          className="text-blue-400 hover:bg-gray-300 h-fit px-2 py-2 rounded"
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
          {showFilterBar && (
            <div className="w-full flex bg-gray-200 items-center gap-1 justify-between rounded-sm p-1">
              <div className="flex gap-2">
                <ListFilter className="text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Filter by keyword..."
                  className="w-full outline-none text-sm"
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
              </div>
            </div>
          )}

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
              {/* FEATURE */}
<div
  onClick={() => {
    setOpenWorkItem(false);
    navigate(`/projects/${project.id}/work-items/new/feature`);
  }}
  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
>
  <Layers size={16} className="text-teal-600" />
  <span>Feature</span>
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

       <div className="mt-2 mb-2 flex justify-between items-center">
  <div className="flex items-center p-3 gap-3">
   

    {/* 🔥 SELECT ALL TASKS */}
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={toggleSelectAll}
      />
      <span>Select All</span>
    </label>
  </div>

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
              <tr className="text-gray-700 text-center">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Select Task</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Assigned to</th>


              </tr>
            </thead>

            <tbody>
              {filteredIssues.map((issue, index) => (
                <tr
                  key={issue.id}
                  className="border-b hover:bg-gray-50 text-center transition"
                >
                  <td className="px-3 py-2">{index + 1}</td>

                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={() => toggleIssue(issue.id)}
                    />
                  </td>

                  <td className="px-3 py-2 flex items-center gap-1">
                    {typeIcon[issue.type]}
                    <span className="capitalize">{issue.type}</span>
                  </td>

                  {/* TITLE */}
                  <td className="px-3 py-2 text-center font-medium">
                 <p
  onClick={() => openIssueSingleModal(issue.id, index + 1)}
  className="hover:underline cursor-pointer w-fit"
>
  {issue.name}
</p>


                    {issue.type === "story" && issue.story_points && (
                      <span className="ml-2 text-xs text-green-600">
                        (Story_Points : {issue.story_points})
                      </span>
                    )}
                  </td>
                  <td>
                    {issue.priority}
                  </td>
                  {/* ASSIGNED TO */}
                  <td className="px-3 py-2">
                    {getUserName(issue.assignee_id)} {/* <-- use assignee_id */}
                  </td>
                 {/* TAGS */}


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
            className={`border px-4 py-2 rounded text-white ${!form.sprintId || selectedIssues.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500"
              }`}
          >
            Assign Sprint
          </button>
        </div>
      </div>

      <BacklogModal
        modalIssue={modalIssue}
        setModalIssue={setModalIssue}
        users={users}
        issueComments={issueComments}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
        onIssueUpdated={handleUpdateIssue}
         project={project}
      />
    </>
  );
};

export default Backlog;
