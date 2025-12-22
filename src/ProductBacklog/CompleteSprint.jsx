import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { getCompleteSprints } from "../API/projectAPI";
import { useParams } from "react-router-dom";

const CompleteSprint = () => {
  const { projectId } = useParams(); // ✅ correct source

  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    fetchCompletedSprints();
  }, [projectId]);

  const fetchCompletedSprints = async () => {
    try {
      setLoading(true);
      const res = await getCompleteSprints(projectId);
      setSprints(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch completed sprints", err);
    } finally {
      setLoading(false); // ✅ now always runs
    }
  };

  if (loading) {
    return <p className="text-gray-500 mt-4">Loading completed sprints...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h1 className="text-xl font-semibold mb-4"> Completed Sprints</h1>

      {sprints.length === 0 ? (
        <p className="text-gray-400">No completed sprints yet</p>
      ) : (
        sprints.map((sprint) => (
          <div key={sprint.id} className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={18} />
              <h2 className="font-semibold">{sprint.name}</h2>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Completed at: {new Date(sprint.completed_at).toLocaleString()}
            </p>

            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Completed Issues ({sprint.completed_issues?.length || 0})
              </p>

              {sprint.completed_issues?.map((issue) => (
                <div key={issue.id} className="bg-gray-50 border rounded-md p-2 mb-2">
                  <p className="font-medium">{issue.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {issue.type} • {issue.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompleteSprint;
