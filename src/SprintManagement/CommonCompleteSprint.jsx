import React, { useEffect, useState } from "react";
import { getCompletedGlobalSprints } from "../API/projectAPI";

const CommonCompleteSprint = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW STATE
  const [selectedSprint, setSelectedSprint] = useState(null);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        setLoading(true);
        const data = await getCompletedGlobalSprints();
        setSprints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, []);

  if (loading)
    return (
      <div className="py-6">
        Loading Completed Sprints...
      </div>
    );

  return (
    <div className="text-white p-4">
      {sprints.length === 0 && (
        <p className="text-center text-gray-400">
          No completed sprints.
        </p>
      )}

      {/* ================= SPRINT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            onClick={() => setSelectedSprint(sprint)} // 🔥 CLICK
            className="bg-gray-300 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-black">
                {sprint.name}
              </h3>
              <span className="px-2 py-1 text-md rounded-full text-green-600 font-semibold">
                {sprint.status}
              </span>
            </div>

            {/* Body */}
            <div className="text-sm text-black space-y-2">
              <p>
                <span>Issues Count:</span>{" "}
                <span className="font-medium">
                  {sprint.issue_count}
                </span>
              </p>

              {sprint.start_date && sprint.end_date && (
                <p>
                  <span>Duration:</span>{" "}
                  {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                  {new Date(sprint.end_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= SPRINT DETAILS MODAL ================= */}
      {selectedSprint && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-xl p-5 relative">
            
            {/* Close */}
            <button
              onClick={() => setSelectedSprint(null)}
              className="absolute top-3 text-black right-4 text-xl font-bold"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-xl font-semibold mb-2 text-black">
              {selectedSprint.name} – Issues
            </h2>

            {/* Issues */}
            {selectedSprint.issues?.length === 0 ? (
              <p className="text-gray-500">No issues in this sprint</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {selectedSprint.issues?.map((issue) => (
                  <div
                    key={issue.id}
                    className="border rounded-lg p-3 bg-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-black">
                        {issue.name}
                      </h4>
                      <span className="text-sm text-blue-600">
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonCompleteSprint;
