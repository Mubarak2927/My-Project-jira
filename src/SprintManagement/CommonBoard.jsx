import React, { useEffect, useState } from "react";
import { getGlobalSprintBoard, getGlobalSprints, updateGlobalIssueStatus } from "../API/projectAPI";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
    // deep clone columns
    const newColumns = board.columns.map(col => ({
      ...col,
      issues: [...col.issues]
    }));

    const sourceColIndex = newColumns.findIndex(col => col.column_info.id === source.droppableId);
    const destColIndex = newColumns.findIndex(col => col.column_info.id === destination.droppableId);

    const [movedIssue] = newColumns[sourceColIndex].issues.splice(source.index, 1);
    newColumns[destColIndex].issues.splice(destination.index, 0, movedIssue);

    // update board with new columns
    setBoard({ ...board, columns: newColumns });

    // update backend
    await updateGlobalIssueStatus(draggableId, newColumns[destColIndex].column_info.id);
  } catch (err) {
    console.error("Failed to update issue status", err);
  }
};



  if (loading) return <div className="text-white">Loading Board...</div>;
  if (!board) return <div className="text-white">No Board Found</div>;

  return (
    <div className="flex  gap-4 overflow-x-auto p-4 bg-gray-100 h-[75vh] overflow-y-auto">
      
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
                          {issue.name}
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
  );
};

export default CommonBoard;
