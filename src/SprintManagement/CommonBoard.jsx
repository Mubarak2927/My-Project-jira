import React, { useEffect, useState } from "react";
import { getGlobalSprintBoard, getGlobalSprints, updateGlobalIssueStatus, completeGlobalSprint } from "../API/projectAPI";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Bug, CheckSquare, BookOpen, Layers } from "lucide-react";
import toast from "react-hot-toast"; // for notifications

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
  

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    try {
      const newColumns = board.columns.map(col => ({
        ...col,
        issues: [...col.issues]
      }));

      const sourceColIndex = newColumns.findIndex(col => col.column_info.id === source.droppableId);
      const destColIndex = newColumns.findIndex(col => col.column_info.id === destination.droppableId);

      const [movedIssue] = newColumns[sourceColIndex].issues.splice(source.index, 1);
      newColumns[destColIndex].issues.splice(destination.index, 0, movedIssue);

      setBoard({ ...board, columns: newColumns });

      // Update backend
      await updateGlobalIssueStatus(draggableId, newColumns[destColIndex].column_info.status);

      // Refresh board after update
      const refreshedBoard = await getGlobalSprintBoard(board.sprint_id);
      setBoard(refreshedBoard.board);

    } catch (err) {
      console.error("Failed to update issue status", err);
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
    console.error(err);

    const data = err?.response?.data;

    // 🔥 Pending issues irundha
    if (data?.pending_issues && data.pending_issues.length > 0) {
      toast.error("Pending issues moved to Backlog!");

      // Move all pending issues to Backlog
      for (const issue of data.pending_issues) {
        await updateGlobalIssueStatus(issue.id, "Backlog");
      }

      // Refresh board after moving issues
      const refreshedBoard = await getGlobalSprintBoard(board.sprint_id);
      setBoard(refreshedBoard.board);
    } else {
      toast.error("Failed to complete sprint");
    }
  }
};


  if (loading) return <div className="">Loading Board...</div>;
  if (!board) return <div className="">No Board Found</div>;

  return (
    <>
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleCompleteSprint}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Complete Sprint
        </button>
      </div>

    </div>
    
    <div className="flex  gap-4 overflow-x-auto p-4 bg-gray-100 h-[70vh] overflow-y-auto">
      {/* Complete Sprint Button */}
      

      <DragDropContext onDragEnd={onDragEnd}>
        {board.columns.map((col) => (
          <Droppable droppableId={col.column_info.id} key={col.column_info.id}>
            {(provided) => (
              <div
                className="bg-gray-200 rounded-lg p-4 w-full shadow-md flex flex-col"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3 className="font-semibold text-gray-800 mb-4">{col.column_info.name}</h3>
                {col.issues.length === 0 ? (
                  <p className="text-blue-500 text-center mt-4">No tasks</p>
                ) : (
                  col.issues.map((issue, index) => (
                    <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          className="bg-white p-3 mb-2 rounded shadow-sm cursor-pointer"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
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
