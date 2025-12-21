import { Eye, Plus, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { getSprint, createSprint } from "../API/ProjectAPI";
import { fetchIssuesbySprintId } from "../API/ProjectAPI";


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
  const [activeSprint, setActiveSprint] = useState(null);
const [sprintIssues, setSprintIssues] = useState([]);


const handleSprintClick = async (sprint) => {
  setActiveSprint(sprint);
  try {
    const res = await fetchIssuesbySprintId(sprint.id);

    // ⚠️ backend usually sends like this
    setSprintIssues(res.issues || []);
  } catch (err) {
    console.error(err);
    toast.error("Unable to load sprint tasks");
  }
};

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

  const handleWeekSelect = (week) => {
    const today = new Date();
    let end;
    switch (week) {
      case 1: end = new Date(today); end.setDate(today.getDate() + 7); break;
      case 2: end = new Date(today); end.setDate(today.getDate() + 14); break;
      case 4: end = new Date(today); end.setDate(today.getDate() + 30); break;
      default: end = today;
    }
    const formatDate = (d) => d.toISOString().split("T")[0];
    setStartDate(formatDate(today));
    setEndDate(formatDate(end));
    setSelectedWeek(week);
  };

  return (
    <div className="p-6 bg-gray-200 h-[75vh] overflow-y-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Sprints</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-md hover:scale-105 transition"
        >
          <Plus size={18} /> New Sprint
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 transition"
            >
              <X size={22} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Create New Sprint</h2>

            <div className="grid gap-4 mb-5">
              <input
                type="text"
                placeholder="Sprint Name"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-100 transition"
              />
              <input
                type="text"
                placeholder="Sprint Goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-100 transition"
              />
            </div>

            <div className="flex justify-center gap-3 mb-5">
              {[1,2,4].map((week) => (
                <button
                  key={week}
                  onClick={() => handleWeekSelect(week)}
                  className={`px-5 py-2 rounded-full text-white font-semibold transition ${
                    selectedWeek === week
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  {week} Week{week>1 ? "s" : ""}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1  md:grid-cols-2 gap-4 mb-6">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-100 transition"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-100 transition"
              />
            </div>

            <button
              onClick={handleSprintCreate}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition"
            >
              {loading ? "Adding..." : "Add Sprint"}
            </button>
          </div>
        </div>
      )}

      {/* Sprint List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {sprints.length === 0 && (
          <p className="text-gray-500 italic col-span-full text-center">
            No sprints yet. Create your first one!
          </p>
        )}

        {sprints.map((s) => (
          <div
  key={s.id}
  onClick={() => handleSprintClick(s)}
  className="cursor-pointer relative bg-white p-3 rounded-3xl shadow-lg hover:shadow-2xl transition"
>
  {activeSprint && (
  <div className="mt-10 bg-white rounded-2xl p-5 shadow">
    <h2 className="text-xl font-bold mb-4">
      {activeSprint.name} – Tasks
    </h2>

    {sprintIssues.length === 0 ? (
      <p className="text-gray-400">No tasks assigned</p>
    ) : (
      <div className="space-y-3">
        {sprintIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex justify-between items-center p-3 bg-gray-100 rounded-xl"
          >
            <span className="font-medium">{issue.name}</span>
            <span className="text-xs text-gray-500 capitalize">
              {issue.type}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}


            <div>
              <p className=" text-gray-900">{s.name}</p>
              <p className="text-gray-500 mt-2">{s.goal}</p>
            </div>
            <div className=" flex justify-between items-center text-gray-400 text-xs">
              <span>
                {new Date(s.start_date).toLocaleDateString()} -{" "}
                {new Date(s.end_date).toLocaleDateString()}
              </span>
              <span className="px-3 py-1 rounded-full  bg-gradient-to-r from-green-400 to-teal-500 text-white shadow">
                Start Sprint
              </span>
            </div>

            {/* Optional floating icon */}
            <div className="absolute top-5 right-5 text-indigo-500">
              <Eye size={15}/>
            </div>
          </div>
          
        ))}
        
      </div>
    </div>
  );
}
