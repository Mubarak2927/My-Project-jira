import React, { useEffect, useState } from "react";
import { CheckSquare, BookOpen, Bug } from "lucide-react";
import { getSprint } from "../API/ProjectAPI";
import { useOutletContext } from "react-router";

const Backlog = ({
  epics = [],
  selectedEpic,
  issues = [],
  form,
  setForm,
  handleAdd,
  loading,
}) => {
  
  const filteredIssues = selectedEpic
    ? issues.filter((issue) => issue.epic_id === selectedEpic._id)
    : issues;
  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  const typeIcon = {
  task: <CheckSquare size={14} className="text-blue-600" />,
  story: <BookOpen size={14} className="text-purple-600" />,
  bug: <Bug size={14} className="text-red-600" />,
};

const [sprints, setSprints] = useState([]);
const { project } = useOutletContext();
const [selectedIssues, setSelectedIssues] = useState([]);

const toggleIssue = (id) => {
  setSelectedIssues((prev) =>
    prev.includes(id)
      ? prev.filter((i) => i !== id)
      : [...prev, id]
  );
};

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

const priorityColors = {
  highest: "bg-red-200 text-red-800",
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
  lowest: "bg-blue-100 text-blue-700",
};



  return (
    <div className="rounded-xl p-3 bg-gray-100 shadow-md/40 w-full h-[73vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Backlog</h2>
        <span className="text-sm text-gray-500">{filteredIssues.length} items</span>
      </div>

      <div className=" shadow-sm/40 bg-gray-300 rounded-lg p-5 mb-4 space-y-2">
        <div className="flex gap-2">
          <select
            className=" shadow-md bg-gray-100 outline-none rounded px-2 py-1"
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
              onChange={(e) => setForm({ ...form, storyPoints: e.target.value })}
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
            className="bg-green-500 text-white px-4 rounded"
          >
            {loading ? 'Adding' :'Add' }
          </button>
      </div>
      <p className="mt-2 mb-2 text-gray-400">Task Lists</p>
      

      {filteredIssues.length === 0 && (
        <p className="text-sm text-gray-500">No tasks in backlog.</p>
      )}

      <div className="space-y-3 overflow-y-auto h-[30vh] pr-1">
  {filteredIssues.map((issue) => (
    <>
    
    <div
      key={issue._id}
      className="bg-gray-300 rounded-xl p-3 shadow-sm
                  transition-all duration-200 flex items-start gap-2 "
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className="mt-5"
      />

      {/* Content */}
      <div className="flex-1">
        {/* Title + Icon */}
        <div className="flex items-center gap-2">
          <p title={issue.type}>
          {typeIcon[issue.type]}
          </p>
          <p
            className={`font-semibold text-gray-800 truncate ${
              issue.completed ? "line-through text-gray-400" : ""
            }`}
          >
            {issue.name}
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
          {/* Priority */}
          <span
            className={`px-2 py-0.5 rounded-full font-medium capitalize
              ${priorityColors[issue.priority] || "bg-gray-100 text-gray-600"}
            `}
          >
            {issue.priority}
          </span>

          {/* Story Points */}
          {issue.type === "story" && issue.story_points && (
            <span className="px-2 py-0.5 rounded-full  text-green-600 font-medium">
              story points:{issue.story_points} 
            </span>
          )}
        </div>
      </div>
    </div>
    </>
  ))}
  
</div>
<div className="flex justify-end mt-5 items-center gap-3">
  <select
    className="border  px-2 py-1 rounded"
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
    className="border  px-4 py-2 rounded bg-blue-500 text-white"
  >
    Assign Sprint
  </button>
</div>


    </div>
  );
};

export default Backlog;
