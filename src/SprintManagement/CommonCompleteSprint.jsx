import React, { useEffect, useState } from "react";
import { getCompletedGlobalSprints } from "../API/projectAPI";

const CommonCompleteSprint = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-white">Loading Completed Sprints...</div>;

  return (
    <div className="text-white">
      {sprints.length === 0 && <p>No completed sprints.</p>}
      <ul>
        {sprints.map((sprint) => (
          <li key={sprint.id}>
            {sprint.name} ({sprint.status}) - Issues: {sprint.issue_count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommonCompleteSprint;
