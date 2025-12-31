import React, { useEffect, useState } from "react";
import {
  getGlobalSprintBoard,
  getGlobalSprints,
  updateGlobalIssueStatus,
  completeGlobalSprint
} from "../API/projectAPI";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import toast from "react-hot-toast";

const CommonBoard = () => {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null); // 🔥 NEW
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Initial load – get all sprints
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        const sprintList = await getGlobalSprints();
        setSprints(sprintList);

        if (sprintList.length > 0) {
          setSelectedSprintId(sprintList[0].id); // default first sprint
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
  }, []);

  // 🔥 Load board whenever sprint changes
  useEffect(() => {
    if (!selectedSprintId) return;

    const fetchBoard = async () => {
      try {
        setLoading(true);
        const boardData = await getGlobalSprintBoard(selectedSprintId);
        setBoard(boardData.board);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [selectedSprintId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    try {
      const newColumns = board.columns.map(col => ({
        ...col,
        issues: [...col.issues]
      }));

      const sourceColIndex = newColumns.findIndex(
        col => col.column_info.id === source.droppableId
      );
      const destColIndex = newColumns.findIndex(
        col => col.column_info.id === destination.droppableId
      );

      const [movedIssue] = newColumns[sourceColIndex].issues.splice(source.index, 1);
      newColumns[destColIndex].issues.splice(destination.index, 0, movedIssue);

      setBoard({ ...board, columns: newColumns });

      await updateGlobalIssueStatus(
        draggableId,
        newColumns[destColIndex].column_info.status
      );

      const refreshedBoard = await getGlobalSprintBoard(selectedSprintId);
      setBoard(refreshedBoard.board);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update issue status");
    }
  };

  const handleCompleteSprint = async () => {
    if (!board) return;

    try {
      await completeGlobalSprint(board.sprint_id);
      toast.success("Sprint completed successfully!");
      setBoard(null);
    } catch (err) {
      const data = err?.response?.data;

      if (data?.pending_issues?.length > 0) {
        toast.error("Pending issues moved to Backlog!");

        for (const issue of data.pending_issues) {
          await updateGlobalIssueStatus(issue.id, "Backlog");
        }

        const refreshedBoard = await getGlobalSprintBoard(selectedSprintId);
        setBoard(refreshedBoard.board);
      } else {
        toast.error("Failed to complete sprint");
      }
    }
  };

  if (loading) return <div>Loading Board...</div>;
  if (!board) return <div>No Board Found</div>;

  return (
    <>
      {/* 🔥 TOP BAR */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-3 items-center">
           <label className="font-semibold">Select Sprint :</label>
        <select
          value={selectedSprintId || ""}
          onChange={(e) => setSelectedSprintId(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>

        </div>
       

        <button
          onClick={handleCompleteSprint}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Complete Sprint
        </button>
      </div>

      {/* 🔥 BOARD */}
      <div className="flex gap-4 overflow-x-auto p-4 bg-gray-100 h-[70vh] overflow-y-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          {board.columns.map((col) => (
            <Droppable
              droppableId={col.column_info.id}
              key={col.column_info.id}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-200 rounded-lg p-4 w-full shadow-md flex flex-col"
                >
                  <h3 className="font-semibold mb-4">
                    {col.column_info.name}
                  </h3>

                  {col.issues.length === 0 ? (
                    <p className="text-blue-500 text-center mt-4">
                      No tasks
                    </p>
                  ) : (
                    col.issues.map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 mb-2 rounded shadow-sm cursor-pointer"
                          >
                            <p className="capitalize">{issue.name}</p>
                            <p className="text-blue-500">{issue.type}</p>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </>
  );
};

export default CommonBoard;
