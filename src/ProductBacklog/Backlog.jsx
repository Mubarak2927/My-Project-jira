import React, { useEffect, useState } from "react";
import { CheckSquare, BookOpen, Bug, Plus } from "lucide-react";
import { getSprint, sprintTaskMove } from "../API/projectAPI";
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
  selectedIssues
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
    <div className="rounded-xl p-3 bg-gray-100 shadow-md/40 w-full h-[73vh]">
      <Toaster position="top-right"/>
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Backlog</h2>
        <span className="text-sm text-gray-500">
          {filteredIssues.length} items
        </span>
      </div>

      {/* ================= CREATE ISSUE ================= */}
      <div className="shadow-sm/40 bg-gray-300 rounded-lg p-5 mb-4 space-y-2">
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
          <Plus size={15}/>{loading ? "Adding" : "Add Task"}
        </button>
      </div>

      <p className="mt-2 mb-2 text-gray-400">Task Lists</p>

      {/* ================= ISSUE LIST ================= */}
      <div className="space-y-3 overflow-y-auto h-[30vh] pr-1">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id} // ✅ FIX (_id → id)
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
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
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
                {issue.type === "story" && issue.story_points && (
                  <span className="px-2 py-0.5 rounded-full text-green-600 font-medium">
                    SP: {issue.story_points}
                  </span>
                )}
                <span className="text-shadow-lg">
                  {issue.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ASSIGN SPRINT ================= */}
      <div className="flex justify-end mt-5 items-center gap-3">
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
  );
};

export default Backlog;
