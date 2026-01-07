import { Eye, Plus, SquarePen, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import {
  getSprint,
  createSprint,
  getIssues,
  startSprints,
  updateSprint,
  deleteSprint,
  deleteIssueFromSprint,
  getRunningSprints,
} from "../API/projectAPI";

export default function Sprint() {
  const { project } = useOutletContext();
  const projectId = project?.id;

  const [showModal, setShowModal] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [sprintName, setSprintName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);

  /* 🔥 NEW STATES (ADDED – NOT BREAKING OLD CODE) */
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintIssues, setSprintIssues] = useState([]);
  /* 🔥 START SPRINT STATE */
  const [startingSprint, setStartingSprint] = useState(false);
  const [allIssues, setAllIssues] = useState([]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSprint, setViewSprint] = useState(null);
  const [viewSprintIssues, setViewSprintIssues] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSprint, setEditSprint] = useState(null);

  // Form fields for editing
  const [editSprintName, setEditSprintName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  /* ================= FETCH SPRINTS ================= */
  const fetchSprints = async () => {
    if (!projectId) return;
    try {
      const res = await getSprint(projectId);
      setSprints(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sprints");
    }
  };

  useEffect(() => {
    if (project) fetchSprints();
  }, [project]);

  /* ================= FETCH SPRINT ISSUES ================= */
  const fetchSprintIssues = async (sprintId) => {
    try {
      const allIssues = await getIssues(projectId);

      const filtered = allIssues.filter(
        (issue) => issue.sprint_id === sprintId
      );

      setSprintIssues(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sprint tasks");
    }
  };

  /* ================= CREATE SPRINT ================= */
  const handleSprintCreate = async () => {
    if (!sprintName || !goal || !startDate || !endDate) {
      toast.error("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      await createSprint({
        name: sprintName,
        project_id: projectId,
        goal,
        start_date: `${startDate}T00:00:00`,
        end_date: `${endDate}T23:59:59`,
      });
      toast.success("Sprint created successfully!");
      setSprintName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setSelectedWeek(null);
      setShowModal(false);
      await fetchSprints();
    } catch (err) {
      console.error(err);
      toast.error("Sprint creation failed");
    }
    setLoading(false);
  };

  /* ================= QUICK WEEK SELECT ================= */
  const handleWeekSelect = (week) => {
    const today = new Date();
    let end;
    switch (week) {
      case 1:
        end = new Date(today);
        end.setDate(today.getDate() + 7);
        break;
      case 2:
        end = new Date(today);
        end.setDate(today.getDate() + 14);
        break;
      case 4:
        end = new Date(today);
        end.setDate(today.getDate() + 30);
        break;
      default:
        end = today;
    }
    const formatDate = (d) => d.toISOString().split("T")[0];
    setStartDate(formatDate(today));
    setEndDate(formatDate(end));
    setSelectedWeek(week);
  };

 const handleStartSprint = async () => {
  if (!selectedSprint) return;

  if (sprintIssues.length === 0) {
    toast.error("Add at least one issue to start sprint");
    return;
  }

  try {
    setStartingSprint(true);

    await startSprints(selectedSprint.id, sprintIssues);

    toast.success(`Sprint ${selectedSprint.name} started`);

    // ✅ update sprint status
    setSprints((prev) =>
      prev.map((sp) =>
        sp.id === selectedSprint.id
          ? { ...sp, status: "running" }
          : sp
      )
    );

    // ✅ VERY IMPORTANT
    await fetchSprintIssues(selectedSprint.id);

  } catch (err) {
    console.error(err);
    toast.error("Failed to start sprint");
  } finally {
    setStartingSprint(false);
  }
};

useEffect(() => {
  const loadRunningSprintBoard = async () => {
    try {
      const res = await getRunningSprints(projectId);
      const sprintId = res?.sprints?.[0]?.sprint_id;

      if (sprintId) {
        await loadSprintBoard(sprintId); // 👈 sprint issues board
      } else {
        await loadBoard(); // fallback
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (projectId) loadRunningSprintBoard();
}, [projectId]);



  const handleViewSprint = async (sprint) => {
    setViewSprint(sprint);
    setViewModalOpen(true);

    try {
      const allIssues = await getIssues(projectId);
      const filtered = allIssues.filter(
        (issue) => issue.sprint_id === sprint.id
      );
      setViewSprintIssues(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sprint tasks");
    }
  };
  const handleEditSprint = (sprint) => {
    setEditSprint(sprint);
    setEditSprintName(sprint.name);
    setEditGoal(sprint.goal);
    setEditStartDate(sprint.start_date.split("T")[0]);
    setEditEndDate(sprint.end_date.split("T")[0]);
    setEditModalOpen(true);
  };
  const handleSaveSprint = async () => {
    if (!editSprintName || !editGoal || !editStartDate || !editEndDate) {
      toast.error("All fields are required!");
      return;
    }

    setEditLoading(true);
    try {
      await updateSprint(editSprint.id, {
        name: editSprintName,
        goal: editGoal,
        start_date: `${editStartDate}T00:00:00`,
        end_date: `${editEndDate}T23:59:59`,
      });
      toast.success("Sprint updated successfully!");
      setEditModalOpen(false);
      await fetchSprints(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sprint");
    }
    setEditLoading(false);
  };
  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm("Are you sure you want to delete this sprint?")) return;

    try {
      await deleteSprint(sprintId);
      toast.success("Sprint deleted successfully!");
      // Refresh sprint list
      await fetchSprints();

      // Reset selected sprint if deleted
      if (selectedSprint?.id === sprintId) {
        setSelectedSprint(null);
        setSprintIssues([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sprint");
    }
  };

  const handleDeleteIssueFromSprint = async (sprintId, issueId) => {
    if (
      !window.confirm("Are you sure you want to remove this issue from sprint?")
    )
      return;

    try {
      await deleteIssueFromSprint(sprintId, issueId);
      toast.success("Issue removed from sprint");

      // 🔥 UI refresh (remove deleted issue immediately)
      setSprintIssues((prev) => prev.filter((issue) => issue.id !== issueId));

      // also update view modal issues if open
      setViewSprintIssues((prev) =>
        prev.filter((issue) => issue.id !== issueId)
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove issue from sprint");
    }
  };

  return (
    <div className="p-6 bg-gray-200 h-[75vh] overflow-y-auto">
      <Toaster position="top-right" />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl text-gray-900">Sprints</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 cursor-pointer  text-purple-600 rounded-full shadow-sm/30 hover:scale-103 transition"
        >
          <Plus size={18} /> Create Sprint
        </button>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-500"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl  mb-6 text-center">Create New Sprint</h2>

            <div className="grid gap-4 mb-5">
              <input
                type="text"
                placeholder="Sprint Name"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              />
              <input
                type="text"
                placeholder="Sprint Goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              />
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col w-fit">
                <label htmlFor="">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-3 rounded-xl border"
                />
              </div>
              <div className="flex flex-col w-fit">
                <label htmlFor="">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-3 rounded-xl border"
                />
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-5">
              {[1, 2, 4].map((week) => (
                <button
                  key={week}
                  onClick={() => handleWeekSelect(week)}
                  className={`px-5 py-2 rounded-full cursor-pointer hover:scale-105 transition text-black  ${
                    selectedWeek === week
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {week} Week{week > 1 ? "s" : ""}
                </button>
              ))}
            </div>

            <button
              onClick={handleSprintCreate}
              disabled={loading}
              className="w-full py-3 mt-5 bg-indigo-600 text-white rounded-xl hover:scale-103 transition cursor-pointer"
            >
              {loading ? "Adding..." : "Add Sprint"}
            </button>
          </div>
        </div>
      )}

      {/* ================= SPRINT LIST ================= */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {sprints.map((s) => {
          const isSelected = selectedSprint?.id === s.id;
          return (
            <div
              key={s.id}
              onClick={() => {
                if (selectedSprint?.id === s.id) {
                  // same sprint clicked → hide
                  setSelectedSprint(null);
                  setSprintIssues([]);
                } else {
                  // new sprint clicked → show
                  setSelectedSprint(s);
                  fetchSprintIssues(s.id);
                }
              }}
              className={`cursor-pointer relative bg-white p-4 rounded-3xl shadow-lg ${
                isSelected ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-gray-500 mt-1">{s.goal}</p>
              {isSelected && sprintIssues.length > 0 && (
  <div className="flex justify-end mb-4">
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (s.status !== "running") handleStartSprint();
      }}
      disabled={startingSprint || s.status === "running"}
      className={`px-6 py-3 rounded-full transition
        ${
          s.status === "running"
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-green-600 text-white hover:scale-105 cursor-pointer"
        }
      `}
    >
      {s.status === "running"
        ? "Sprint Running"
        : startingSprint
        ? "Starting..."
        : "Start Sprint"}
    </button>
  </div>
)}


              <div className="flex justify-between   items-center text-xs mt-4">
                <div>
                  {new Date(s.start_date).toLocaleDateString()} -{" "}
                  {new Date(s.end_date).toLocaleDateString()}
                </div>
                <div className="flex gap-2 items-center">
                  <button>
                    <Eye
                      size={14}
                      className="cursor-pointer text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSprint(s);
                      }}
                    />
                  </button>
                  <SquarePen
                    size={14}
                    className="cursor-pointer text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent selecting sprint
                      handleEditSprint(s);
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent selecting sprint
                      handleDeleteSprint(s.id);
                    }}
                  >
                    <Trash2 size={14} className="text-red-600 cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {editModalOpen && editSprint && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl mb-6 text-center">Edit Sprint</h2>

            <div className="grid gap-4 mb-5">
              <input
                type="text"
                placeholder="Sprint Name"
                value={editSprintName}
                onChange={(e) => setEditSprintName(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              />
              <input
                type="text"
                placeholder="Sprint Goal"
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              />
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col w-fit">
                <label>Start Date</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="px-4 py-3 rounded-xl border"
                />
              </div>
              <div className="flex flex-col w-fit">
                <label>End Date</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="px-4 py-3 rounded-xl border"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSprint}
              disabled={editLoading}
              className="w-full py-3 mt-5 bg-indigo-600 text-white rounded-xl hover:scale-103 transition cursor-pointer"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
      {viewModalOpen && viewSprint && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl mb-4 text-center">{viewSprint.name}</h2>
            <p className="text-gray-600 mb-4">{viewSprint.goal}</p>
            <p className="text-xs text-gray-500 mb-3">
              {new Date(viewSprint.start_date).toLocaleDateString()} -{" "}
              {new Date(viewSprint.end_date).toLocaleDateString()}
            </p>

            <h3 className="font-semibold mb-2">Issues:</h3>
            {viewSprintIssues.length === 0 ? (
              <p className="text-gray-500">No tasks assigned</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {viewSprintIssues.map((issue) => (
                  <div key={issue.id} className="bg-gray-100 p-3 rounded-xl">
                    <p className="font-semibold">{issue.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {issue.type} • {issue.priority}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ================= SPRINT TASKS ================= */}
      {selectedSprint && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">
            Tasks in Sprint: {selectedSprint.name}
          </h2>

          {sprintIssues.length === 0 ? (
            <p className="text-gray-500">No tasks assigned</p>
          ) : (
            <div className="space-y-3">
              {sprintIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white p-3 flex items-center  justify-between rounded-xl shadow"
                >
                  <div>
                    <p className="font-semibold">{issue.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {issue.type} • {issue.priority}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIssueFromSprint(selectedSprint.id, issue.id);
                    }}
                  >
                    <Trash2 size={15} className="text-red-600 cursor-pointer" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
