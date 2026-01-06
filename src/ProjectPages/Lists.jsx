import React, { useEffect, useState } from "react";
import { ClipboardList, Clock, List, X } from "lucide-react";
import { getListByKey } from "../API/projectAPI";
import { useOutletContext } from "react-router-dom";

const ListsView = () => {
  const { project, activeSprint } = useOutletContext(); // 🔥 activeSprint added
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 modal state
  const [selectedTask, setSelectedTask] = useState(null);

  const [showOptions, setShowOptions] = useState(false);
const [showDoneOnly, setShowDoneOnly] = useState(false);

const filteredTasks = showDoneOnly
  ? tasks.filter((task) => task.status === "done")
  : tasks;

  useEffect(() => {
    if (project?.id) fetchTasks();
  }, [project]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getListByKey(project.id);
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 sprint name logic
  // const getSprintNameForIssue = (issue) => {
  //   if (
  //     issue.location === "sprint" &&
  //     issue.sprint_id &&
  //     activeSprint?.id === issue.sprint_id
  //   ) {
  //     return activeSprint.name;
  //   }
  //   return "Backlog";
  // };

  return (
    <div className="p-6 mt-5 w-full">
      <div className="flex justify-between">
      <h2 className="text-2xl font-bold mb-4">Task List</h2>
<div className="relative">
  <button
    onClick={() => setShowOptions((prev) => !prev)}
    className="p-2 rounded hover:bg-gray-200"
  >
    <List />
  </button>

  {/* Options Dropdown */}
  {showOptions && (
    <div className="absolute right-0 -mt-5 w-fit bg-white  rounded shadow-lg p-3 z-20">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Done</span>

        {/* Toggle */}
        <button
          onClick={() => setShowDoneOnly((prev) => !prev)}
          className={`w-10 h-5 flex items-center cursor-pointer rounded-full p-1 transition ${
            showDoneOnly ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
              showDoneOnly ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
    </div>
  )}
</div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Clock className="w-8 h-8 animate-spin mb-3" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
          <p>List Empty!</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-300">
              <tr>
                <th className="px-3 py-2    text-center">SI No</th>
                <th className="px-3 py-2   text-center">Name</th>
                <th className="px-3 py-2   text-center">Epic</th>
                <th className="px-3 py-2   text-center">Type</th>
                <th className="px-3 py-2   text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task, index) => (

                <tr
                  key={task.id}
                  className="bg-gray-100 hover:bg-gray-300 transition-colors"
                >
                  <td className="px-3 py-2 text-center border-b border-gray-300">
                    {index + 1}
                  </td>

                  <td className="px-3 py-2 border-b border-gray-300">
                    <p
                      className="hover:underline cursor-pointer font-medium"
                      onClick={() =>
  setSelectedTask({
    ...task,
    serialNo: index + 1,
  })
}

                    >
                      {task.name}
                    </p>
                  </td>

                  <td className="px-3 py-2 border-b border-gray-300">
                    {task.epic_name || "-"}
                  </td>

                  <td className="px-3 py-2 text-center border-b border-gray-300 capitalize">
                    {task.type}
                  </td>

                  <td className="px-3 py-2 text-center border-b border-gray-300 capitalize">
                    {task.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= DETAILS MODAL ================= */}
      {selectedTask && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[65vw] h-[50vh] rounded-lg shadow-lg relative flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className=" truncate">
          <p className="capitalize">
          {selectedTask.type}

          </p>
          <p className="text-gray-500 text-sm">
  ID : {selectedTask.serialNo}
</p>
          <p>
          {selectedTask.name}

          </p>
        </div>

        <button
          onClick={() => setSelectedTask(null)}
          className="text-gray-500 hover:text-black"
        >
          <X />
        </button>
      </div>

      {/* Body (Scrollable Form Area) */}
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">

          <p>
            <span className="font-semibold">Project:</span>{" "}
            {selectedTask.project_key}
          </p>

          <p>
            <span className="font-semibold">Epic:</span>{" "}
            {selectedTask.epic_name || "-"}
          </p>

      

          <p>
            <span className="font-semibold">Priority:</span>{" "}
            {selectedTask.priority}
          </p>

          <p>
            <span className="font-semibold">Status:</span>{" "}
            {selectedTask.status}
          </p>

          <p>
            <span className="font-semibold">Story Points:</span>{" "}
            {selectedTask.story_points ?? "-"}
          </p>

          <p>
            <span className="font-semibold">Estimated Hours:</span>{" "}
            {selectedTask.estimated_hours || "-"}
          </p>

          {/* Full width description */}
          <div className="col-span-2">
            <span className="font-semibold">Description:</span>
            <div className="mt-1 p-3 bg-gray-50 rounded text-gray-600 text-sm max-h-40 overflow-y-auto">
              {selectedTask.description || "No description"}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ListsView;
