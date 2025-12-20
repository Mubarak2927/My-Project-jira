import React from "react";

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

  return (
    <div className="rounded-xl p-4 bg-white w-full h-[70vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Backlog</h2>
        <span className="text-sm text-gray-500">{filteredIssues.length} items</span>
      </div>

      <div className=" shadow-sm/40 rounded-lg p-5 mb-4 space-y-2">
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
            Add
          </button>
      </div>
      

      {filteredIssues.length === 0 && (
        <p className="text-sm text-gray-500">No tasks in backlog.</p>
      )}

      <div className="space-y-2 overflow-y-auto h-[37vh]">
        {filteredIssues.map((issue) => (
          <div key={issue._id} className="border rounded px-3 py-2">
            <p className="font-medium">{issue.name}</p>
            <p className="text-xs text-gray-500">
              {issue.type} • {issue.priority}
              {issue.type === "story" && issue.story_points
                ? ` • ${issue.story_points} SP`
                : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Backlog;
