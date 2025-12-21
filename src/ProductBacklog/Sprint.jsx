import { Eye, Plus, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import {
  getSprint,
  createSprint,
  getIssues,
  startSprints,
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

      // 🔥 Call API to move sprint issues to board
      await startSprints(selectedSprint.id, sprintIssues);

      toast.success(`Sprint "${selectedSprint.name}" started 🚀`);

      // Optional: refresh board after starting sprint
      // You can either use context, Redux, or a function passed from JiraBoard to reload
    } catch (err) {
      console.error(err);
      toast.error("Failed to start sprint");
    } finally {
      setStartingSprint(false);
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
                setSelectedSprint(s);
                fetchSprintIssues(s.id);
              }}
              className={`cursor-pointer relative bg-white p-4 rounded-3xl shadow-lg ${
                isSelected ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-gray-500 mt-1">{s.goal}</p>

              {/* ✅ Only show start button if this sprint is selected */}
              {isSelected && sprintIssues.length > 0 && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleStartSprint}
                    disabled={startingSprint}
                    className="px-6 py-3 bg-green-600 text-white rounded-full hover:scale-105 transition cursor-pointer"
                  >
                    {startingSprint ? "Starting..." : "Start Sprint"}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center text-xs mt-4">
                <span>
                  {new Date(s.start_date).toLocaleDateString()} -{" "}
                  {new Date(s.end_date).toLocaleDateString()}
                </span>
                <Eye size={14} />
              </div>
            </div>
          );
        })}
      </div>

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
                <div key={issue.id} className="bg-white p-3 rounded-xl shadow">
                  <p className="font-semibold">{issue.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {issue.type} • {issue.priority}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
