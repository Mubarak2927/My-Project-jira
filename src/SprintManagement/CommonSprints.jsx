import React, { useEffect, useState } from "react";
import { getGlobalSprints, createGlobalSprint } from "../API/projectAPI";

const CommonSprints = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const data = await getGlobalSprints();
      setSprints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();

    const start_iso = new Date(startDate).toISOString();
    const end_iso = new Date(endDate).toISOString();

    try {
      await createGlobalSprint({
        name,
        goal,
        start_date: start_iso,
        end_date: end_iso,
      });

      setModalOpen(false);
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      fetchSprints();
    } catch (err) {
      console.error(err);
      alert("Failed to create sprint");
    }
  };

  const handleWeekClick = (week) => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);

    if (week === 1) {
      end.setDate(today.getDate() + 6); 
    } else if (week === 2) {
      start.setDate(today.getDate() + 7);
      end.setDate(today.getDate() + 13); 
    } else if (week === 4) {
      start.setDate(today.getDate() + 21);
      end.setDate(today.getDate() + 27); 
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
  <div className="p-6  min-h-screen text-gray-900">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Total Sprints</h2>
      <button
        onClick={() => setModalOpen(true)}
        className=" text-purple-600 px-4 py-2 rounded  bg-gray-100 hover:scale-103 cursor-pointer shadow-md transition"
      >
        + Create Sprint
      </button>
    </div>

    {sprints.length === 0 ? (
      <p className="text-gray-600">No active or planned sprints.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className="bg-white p-4 rounded-4xl shadow hover:shadow-lg transition-shadow"
          >
            <h3 className=" font-semibold mb-1 capitalize">{sprint.name}</h3>
            <p className="text-gray-700 mb-2">{sprint.goal}</p>
            <p className="text-gray-500 mb-1">
              Status: <span className="font-medium">{sprint.status}</span>
            </p>
            <p className="text-gray-500">
              Issues: <span className="font-medium">{sprint.issue_count}</span>
            </p>
           <p className="text-gray-500 text-sm mt-2">
  {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
</p>

          </div>
        ))}
      </div>
    )}

    {modalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 pt-20">
        <div className="bg-white text-gray-900 p-6 rounded-xl max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">Create New Sprint</h2>
          <form onSubmit={handleCreateSprint} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Sprint Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 rounded border border-gray-300 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
                className="w-full p-2 rounded border border-gray-300 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleWeekClick(1)}
                className="flex-1 px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 shadow transition"
              >
                Week 1
              </button>
              <button
                type="button"
                onClick={() => handleWeekClick(2)}
                className="flex-1 px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 shadow transition"
              >
                Week 2
              </button>
              <button
                type="button"
                onClick={() => handleWeekClick(4)}
                className="flex-1 px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 shadow transition"
              >
                Week 4
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full p-2 rounded border border-gray-300 focus:border-purple-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full p-2 rounded border border-gray-300 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 shadow"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 shadow"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);



};

export default CommonSprints;
