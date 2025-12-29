import React, { useEffect, useState } from "react";
import {
  getGlobalSprints,
  createGlobalSprint,
  startGlobalSprint,
  deleteSprint,
  getSprintIssues,
} from "../API/projectAPI";
import toast from "react-hot-toast";
import { ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";

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
  const [selectedWeek, setSelectedWeek] = useState(null);

  const [sprintIssues, setSprintIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const runningSprintCount = sprints.filter(
    (sprint) => (sprint.status ?? "").toLowerCase() === "running"
  ).length;
  const formattedRunningCount =
    runningSprintCount < 10 ? `0${runningSprintCount}` : runningSprintCount;

  const totalSprintCount = sprints.length;
  const formattedTotalCount =
    totalSprintCount < 10 ? `0${totalSprintCount}` : totalSprintCount;

  // Check if any sprint is running
  const isAnySprintRunning = sprints.some(
    (s) => (s.status ?? "").toLowerCase() === "running"
  );

  useEffect(() => {
    fetchSprints();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (modalOpen) {
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setSelectedWeek(null);
    }
  }, [modalOpen]);

  const fetchSprintIssues = async (sprintId) => {
    setIssuesLoading(true);
    try {
      const issues = await getSprintIssues(sprintId); // your API call
      setSprintIssues(issues);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sprint issues");
    } finally {
      setIssuesLoading(false);
    }
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const data = await getGlobalSprints();
      const sprintsArray = Array.isArray(data) ? data : data?.data ?? [];
      console.log("Fetched Sprints:", sprintsArray);
      setSprints(sprintsArray);
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
      const newSprint = await createGlobalSprint({
        name,
        goal,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });

      toast.success("Sprint Created Successfully");
      setModalOpen(false);

      setSprints((prev) => [...prev, newSprint]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create sprint");
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm("Are you sure you want to delete this sprint?")) return;

    try {
      await deleteSprint(sprintId);
      toast.success("Sprint deleted successfully");
      setSprints((prev) => prev.filter((s) => s.id !== sprintId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sprint");
    }
  };

  const filteredSprints = sprints.filter((sprint) => {
    const nameText = sprint.name?.toLowerCase() || "";
    const goalText = sprint.goal?.toLowerCase() || "";
    const statusText = sprint.status?.toLowerCase() || "";

    return (
      nameText.includes(searchTerm.toLowerCase()) ||
      goalText.includes(searchTerm.toLowerCase()) ||
      statusText.includes(searchTerm.toLowerCase())
    );
  });

  const handleStartSprint = async (sprintId) => {
    if (isAnySprintRunning) {
      toast.error("Another sprint is already running");
      return;
    }

    try {
      await startGlobalSprint(sprintId);
      toast.success("Sprint Started Successfully");

      setSelectedSprint((prev) => ({
        ...prev,
        status: "running",
      }));

      fetchSprints();
    } catch (error) {
      console.error(error);
      toast.error("Failed to start sprint");
    }
  };

  const handleWeekClick = (week) => {
    setSelectedWeek(week);

    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);

    if (week === 1) end.setDate(today.getDate() + 7);
    if (week === 2) end.setDate(today.getDate() + 14);
    if (week === 4) end.setDate(today.getDate() + 28);

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
    <div className="min-h-screen text-gray-900">
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
        <div>
          <p>
            Total Sprints:{" "}
            <span className="font-bold text-black">{formattedTotalCount}</span>
          </p>
          {/* <p>
            Running Sprints:{" "}
            <span className="font-bold text-green-600">{formattedRunningCount}</span>
          </p> */}
        </div>

        <input
          type="text"
          placeholder="Search by name/status/goal..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border-gray-400 border outline-none px-3 py-2 rounded w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full text-center">
          <thead className="bg-gray-400">
            <tr>
              <th className="p-3">SI No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Goal</th>
              <th className="p-3">Issues Count</th>
              <th className="p-3">Start - End</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentSprints.map((sprint, index) => (
              <tr
                key={sprint.id}
                className="hover:bg-gray-200 border-gray-300 border-b"
              >
                <td className="p-3">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                <td
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setSelectedSprint(sprint);
                    setDetailsModalOpen(true);
                    fetchSprintIssues(sprint.id);
                  }}
                >
                  <p className="hover:underline">{sprint.name}</p>
                </td>
                <td className="p-3">{sprint.goal}</td>
                <td className="p-3">{sprint.issue_count ?? 0}</td>
                <td className="p-3">
                  {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                  {new Date(sprint.end_date).toLocaleDateString()}
                </td>
                <td className="p-3 font-semibold">
                  {sprint.status === "running" ? (
                    <span className="text-green-600">Running</span>
                  ) : (
                    <span className="capitalize">{sprint.status}</span>
                  )}
                </td>
                <td className=" flex justify-center  items-center mt-3.5 text-center">
                  <Trash2
                    size={15}
                    className="text-red-600 cursor-pointer"
                    onClick={() => handleDeleteSprint(sprint.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* DETAILS MODAL */}
      {detailsModalOpen && selectedSprint && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sprint Details</h2>
            </div>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Name:</span> {selectedSprint.name}
              </p>
              <p>
                <span className="font-semibold">Goal:</span> {selectedSprint.goal}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className="capitalize">{selectedSprint.status}</span>
              </p>
              <p>
                <span className="font-semibold">Issues Count:</span> {selectedSprint.issue_count ?? 0}
              </p>
              <p>
                <span className="font-semibold">Duration:</span>{" "}
                {new Date(selectedSprint.start_date).toLocaleDateString()} -{" "}
                {new Date(selectedSprint.end_date).toLocaleDateString()}
              </p>

              <div className="mt-4">
                <h3 className="font-semibold text-lg">Issues</h3>
                {issuesLoading ? (
                  <p>Loading issues...</p>
                ) : sprintIssues.length === 0 ? (
                  <p>No issues found.</p>
                ) : (
                  <ul className="list-disc ml-5 mt-2">
                    {sprintIssues.map((issue) => (
                      <li key={issue.id}>
                        {issue.name} - {issue.type} - {issue.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              {selectedSprint.issue_count > 0 &&
               selectedSprint.status !== "running" &&
               !isAnySprintRunning && (
                <button
                  onClick={() => handleStartSprint(selectedSprint.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Start Sprint
                </button>
              )}

              {selectedSprint.status !== "running" && isAnySprintRunning && (
                <span className="px-4 py-2 text-gray-500">
                  Another sprint is running
                </span>
              )}

              {selectedSprint.status === "running" && (
                <span className="px-4 py-2 text-green-600 font-semibold">
                  Running Sprint
                </span>
              )}

              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
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
                    className={`flex-1 py-2 rounded cursor-pointer transition ${
                      selectedWeek === w
                        ? "bg-green-600 text-white scale-105 shadow-md"
                        : "bg-gray-300 text-black"
                    }`}
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
                  className="px-4 py-2 cursor-pointer bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded"
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
