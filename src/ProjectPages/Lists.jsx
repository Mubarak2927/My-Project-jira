import React, { useEffect, useState } from "react";
import { ClipboardList, Clock } from "lucide-react";
import { getIssues } from "../API/projectAPI";
import { useOutletContext } from "react-router-dom";

const ListsView = () => {
  const { project } = useOutletContext(); // get current project from context
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project?.id) fetchTasks();
  }, [project]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getIssues(project.id);
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-4">Task List</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Clock className="w-8 h-8 animate-spin  mb-3" />
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
            <thead className="bg-gray-200 ">
              <tr>
                <th className="px-3 py-2 border-b text-center">SI No</th>
                <th className="px-3 py-2 border-b text-left">Name</th>
                <th className="px-3 py-2 border-b text-center">Status</th>
                <th className="px-3 py-2 border-b text-center">Type</th>
                <th className="px-3 py-2 border-b text-left">Epic</th>
                <th className="px-3 py-2 border-b text-center">Created At</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id} className="bg-gray-100 text-black hover:bg-gray-300 transition-colors">
                  <td className="px-3 py-2 text-center  border-b border-gray-300">{index + 1}</td>
                  <td className="px-3 py-2  border-b border-gray-300">{task.name}</td>
                  <td className="px-3 py-2 text-center  border-b border-gray-300">{task.status}</td>
                  <td className="px-3 py-2 text-center  border-b border-gray-300">{task.type}</td>
                  <td className="px-3 py-2  border-b border-gray-300">{task.epic_name}</td>
                  <td className="px-3 py-2 text-center  border-b border-gray-300">{task.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListsView;
