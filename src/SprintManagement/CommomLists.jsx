import React, { useState, useEffect } from "react";
import { getGlobalBacklog, getGlobalSprints,  } from "../API/projectAPI";
import { ArrowBigLeftDash, ArrowBigRightDash, ChevronsLeft, ChevronsRight } from "lucide-react";

const CommomLists = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sprints, setSprints] = useState([]); // fetch sprints for dropdown
  const itemsPerPage = 10;

  // Fetch issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await getGlobalBacklog();
        setIssues(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Fetch sprints for dropdown
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const data = await getGlobalSprints();
        setSprints(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSprints();
  }, []);

  // Filter issues based on search
  const filteredIssues = issues.filter(
    (issue) =>
      issue.name.toLowerCase().includes(search.toLowerCase()) ||
      issue.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle sprint assignment
  // const handleAssignSprint = async (issueId, sprintId) => {
  //   try {
  //     await assignIssueToSprint(issueId, sprintId);
  //     setIssues((prev) =>
  //       prev.map((issue) =>
  //         issue.id === issueId ? { ...issue, sprint_id: sprintId } : issue
  //       )
  //     );
  //     alert("Issue assigned to sprint!");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to assign sprint");
  //   }
  // };

  if (loading) return <div className="text-white">Loading Issues...</div>;

  return (
    <div className="">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Lists</h1>
        <input
          type="text"
          placeholder="Search by name or type..."
          className="px-4 py-2 rounded placeholder:text-gray-400 border outline-none"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {currentItems.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-md">
          <table className="w-full">
            <thead className="bg-gray-400 text-white">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  SI No
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Sprint
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {currentItems.map((issue, index) => (
                <tr key={issue.id}>
                  <td className="px-6 py-3 text-sm text-center">{startIndex + index + 1}</td>
                  <td className="px-6 py-3 text-sm text-center">{issue.name}</td>
                  <td className="px-6 py-3 text-sm text-center">{issue.type}</td>
                  <td className="px-6 py-3 text-sm text-center">{issue.status}</td>
                  <td className="px-6 py-3 text-sm text-center">
                    {/* <select
                      value={issue.sprint_id || ""}
                      // onChange={(e) => handleAssignSprint(issue.id, e.target.value)}
                      className="px-2 py-1 rounded text border"
                    >
                      <option value="">Select Sprint</option>
                      {sprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </select> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4 gap-4">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="px-4 py-2 cursor-pointer rounded disabled:opacity-50"
          >
            <ChevronsLeft />
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 cursor-pointer rounded disabled:opacity-60"
          >
            <ChevronsRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommomLists;
