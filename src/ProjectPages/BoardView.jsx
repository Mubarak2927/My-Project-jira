import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bug, BookOpen, CheckSquare } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getBoardByProjectId, sprintTaskMoveColumn } from "../API/projectAPI";

/* ---------- ICON ---------- */
const getIcon = (type) => {
  if (type === "bug") return <Bug className="text-red-500 w-4 h-4" />;
  if (type === "story") return <BookOpen className="text-blue-500 w-4 h-4" />;
  return <CheckSquare className="text-green-500 w-4 h-4" />;
};

export default function JiraBoard() {
  /* 🔥 PROJECT ID FROM URL */
  const { projectId } = useParams();

  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD BOARD ---------- */
  useEffect(() => {
    if (!projectId) return;
    loadBoard();
  }, [projectId]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const res = await getBoardByProjectId(projectId);
      console.log("BOARD RESPONSE:", res);

      const boardColumns = res?.columns?.board?.columns || [];
      setColumns(boardColumns);
    } catch (err) {
      console.error("Failed to load board", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- DRAG END ---------- */
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceCol = columns.find((c) => c.column_info.id === source.droppableId);
    const destCol = columns.find((c) => c.column_info.id === destination.droppableId);

    if (!sourceCol || !destCol) return;

    const movedIssue = sourceCol.issues.find((i) => i.id === draggableId);

    try {
      /* 🔥 BACKEND UPDATE */
      await sprintTaskMoveColumn(draggableId, {
        status: destCol.column_info.status,
      });

      /* 🔥 FRONTEND UPDATE */
      const updated = columns.map((col) => {
        if (col.column_info.id === sourceCol.column_info.id) {
          return {
            ...col,
            issues: col.issues.filter((i) => i.id !== draggableId),
          };
        }

        if (col.column_info.id === destCol.column_info.id) {
          return {
            ...col,
            issues: [...col.issues, { ...movedIssue, status: destCol.column_info.status }],
          };
        }

        return col;
      });

      setColumns(updated);
    } catch (err) {
      console.error("Issue move failed", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg h-full flex flex-col">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-end gap-3 mb-6">
        <button className="px-4 py-2 shadow-sm/20 text-blue-600 hover:bg-gray-200 hover:scale-104 cursor-pointer transition rounded-lg">
          + Add Column
        </button>
        <button className="shadow-sm/20  text-green-600 hover:bg-gray-200 hover:scale-104 cursor-pointer transition  px-4 py-2 rounded-lg">
          Complete Sprint
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-20">Loading board...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto">
            {columns.map((col) => (
              <Droppable key={col.column_info.id} droppableId={col.column_info.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-200 rounded-2xl p-4 w-full h-[56vh] flex flex-col shadow-md"
                  >
                    <h2 className="text-gray-700 font-semibold mb-4">
                      {col.column_info.name}
                    </h2>

                    <div className="space-y-3 flex-1">
                      {col.issues.length === 0 && (
                        <p className="text-blue-400 text-sm text-center mt-10">
                          No tasks
                        </p>
                      )}

                      {col.issues.map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-xl p-3 shadow hover:shadow-lg transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {getIcon(issue.type)}
                                <span className="font-medium text-sm">{issue.name}</span>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                {issue.type?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
