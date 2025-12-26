import React, { useEffect, useState } from "react";
import {
  getGlobalSprints,
  createGlobalSprint,
  startGlobalSprint,
} from "../API/projectAPI";
import toast from "react-hot-toast";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZE = 10;

const CommonSprints = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const runningSprintCount = sprints.filter(
    (sprint) => sprint.status === "running"
  ).length;
  const formattedRunningCount =
    runningSprintCount < 10 ? `0${runningSprintCount}` : runningSprintCount;

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
      toast.error("Failed to fetch sprints");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();

    try {
      await createGlobalSprint({
        name,
        goal,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });

      toast.success("Sprint Created Successfully");
      setModalOpen(false);
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      fetchSprints();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create sprint");
    }
  };

  const filteredSprints = sprints.filter((sprint) => {
    const name = sprint.name?.toLowerCase() || "";
    const goal = sprint.goal?.toLowerCase() || "";
    const status = sprint.status?.toLowerCase() || "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      goal.includes(searchTerm.toLowerCase()) ||
      status.includes(searchTerm.toLowerCase())
    );
  });

  /* ✅ START SPRINT LOGIC */
  const handleStartSprint = async (sprintId) => {
    try {
      await startGlobalSprint(sprintId);

      toast.success("Sprint Started Successfully");

      // backend status update reflect panna
      fetchSprints();
    } catch (error) {
      console.error("Start sprint error:", error);
      toast.error("Failed to start sprint");
    }
  };

  const handleWeekClick = (week) => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);

    if (week === 1) end.setDate(today.getDate() + 6);
    if (week === 2) {
      start.setDate(today.getDate() + 7);
      end.setDate(today.getDate() + 13);
    }
    if (week === 4) {
      start.setDate(today.getDate() + 21);
      end.setDate(today.getDate() + 27);
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  const totalPages = Math.ceil(filteredSprints.length / PAGE_SIZE);

  const currentSprints = filteredSprints.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  if (loading) return <div>Loading Sprints...</div>;

  return (
    <div className=" min-h-screen text-gray-900">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Total Sprints</h2>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-gray-100 text-purple-600 rounded shadow"
        >
          + Create Sprint
        </button>
      </div>
      <div className="flex justify-between mt-5 mb-3">
        <p className="text-gray-400">
          Running Sprints:{" "}
          <span className="font-bold">{formattedRunningCount}</span>
        </p>

        <input
          type="text"
          placeholder="Search by name/status....."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border-gray-400 border outline-none px-3 py-2 rounded w-64 "
        />
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full text-center">
          <thead className="bg-gray-400">
            <tr>
              <th className="p-3">SI No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Goal</th>
              <th className="p-3">Status</th>
              <th className="p-3">Issues</th>
              <th className="p-3">Start - End</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentSprints.map((sprint, index) => (
              <tr
                key={sprint.id}
                className="hover:bg-gray-300 border-b border-gray-300"
              >
                <td className="p-3">
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </td>
                <td
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setSelectedSprint(sprint);
                    setDetailsModalOpen(true);
                  }}
                >
                  <p className="hover:underline  text-center">{sprint.name}</p>
                </td>

                <td className="p-3">{sprint.goal}</td>

                {/* STATUS */}
                <td className="p-3 font-semibold">
                  {sprint.status === "running" ? (
                    <span className="text-green-600">Running</span>
                  ) : (
                    <span className="text-gray-600 capitalize">
                      {sprint.status}
                    </span>
                  )}
                </td>

                <td className="p-3">{sprint.issue_count}</td>

                <td className="p-3">
                  {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                  {new Date(sprint.end_date).toLocaleDateString()}
                </td>

                {/* ✅ START SPRINT BUTTON */}
                <td className="p-3">
                  {sprint.issue_count > 0 && sprint.status !== "running" ? (
                    <button
                      onClick={() => handleStartSprint(sprint.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Start Sprint
                    </button>
                  ) : sprint.status === "running" ? (
                    <span className="text-green-600 font-semibold">
                      Running Sprint
                    </span>
                  ) : (
                    <span className="text-gray-400">{""}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detailsModalOpen && selectedSprint && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedSprint.name} Details
            </h2>

            <p>
              <strong>Goal:</strong> {selectedSprint.goal}
            </p>
            <p>
              <strong>Status:</strong> {selectedSprint.status}
            </p>
            <p>
              <strong>Issues:</strong> {selectedSprint.issue_count}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(selectedSprint.start_date).toLocaleDateString()}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {new Date(selectedSprint.end_date).toLocaleDateString()}
            </p>

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4 gap-2">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          <ChevronsLeft />
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          <ChevronsRight />
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Sprint</h2>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <input
                className="w-full border p-2 rounded"
                placeholder="Sprint Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />

              <div className="flex gap-2">
                {[1, 2, 4].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWeekClick(w)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded"
                  >
                    Week {w}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full border p-2 rounded"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded"
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
