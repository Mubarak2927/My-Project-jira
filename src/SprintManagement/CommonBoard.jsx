import React, { useEffect, useState } from "react";
import { getGlobalSprintBoard, getGlobalSprints } from "../API/projectAPI";

const CommonBoard = () => {
  const [sprints, setSprints] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const sprintList = await getGlobalSprints();
        setSprints(sprintList);
        if (sprintList.length > 0) {
          const boardData = await getGlobalSprintBoard(sprintList[0].id);
          setBoard(boardData.board);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, []);

  if (loading) return <div className="text-white">Loading Board...</div>;
  if (!board) return <div className="text-white">No Board Found</div>;

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold mb-4">{board.name}</h2>
      {board.columns.map((col) => (
        <div key={col.column_info.id} className="mb-4">
          <h3 className="font-medium">{col.column_info.name}</h3>
          <ul className="ml-4">
            {col.issues.map((issue) => (
              <li key={issue.id}>
                {issue.name} - {issue.status}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CommonBoard;
