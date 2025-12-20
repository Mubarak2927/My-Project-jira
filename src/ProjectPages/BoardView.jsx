import React, { useState } from "react";
import { Bug, BookOpen, CheckSquare } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";


const columns = [
  { key: "todo", title: "To Do" },
  { key: "progress", title: "In Progress" },
  { key: "review", title: "In Review" },
  { key: "done", title: "Done" },
];

const initialIssues = [
  {
    id: "1",
    title: "Login page UI",
    type: "task",
    status: "todo",
  },
  {
    id: "2",
    title: "Fix API bug",
    type: "bug",
    status: "progress",
  },
  {
    id: "3",
    title: "Sprint documentation",
    type: "story",
    status: "review",
  },
];

const getIcon = (type) => {
  if (type === "bug") return <Bug className="text-red-500 w-4 h-4" />;
  if (type === "story") return <BookOpen className="text-blue-500 w-4 h-4" />;
  return <CheckSquare className="text-green-500 w-4 h-4" />;
};

export default function JiraBoard() {
  const [issues, setIssues] = useState(initialIssues);

  // 🔥 Drag end handler
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === draggableId
          ? { ...issue, status: destination.droppableId }
          : issue
      )
    );
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      {/* Header */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add column
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Complete Sprint
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-6">
          {columns.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-200 rounded-2xl p-4 h-[60vh] shadow-md flex flex-col"
                >
                  <h2 className="text-gray-700 font-semibold mb-4">
                    {col.title}
                  </h2>

                  <div className="space-y-3 overflow-y-auto">
                    {issues.filter((i) => i.status === col.key).length === 0 && (
                      <p className="text-blue-400 text-sm text-center mt-10">
                        No tasks
                      </p>
                    )}

                    {issues
                      .filter((i) => i.status === col.key)
                      .map((issue, index) => (
                        <Draggable
                          draggableId={issue.id}
                          index={index}
                          key={issue.id}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-xl p-3 shadow
                                         hover:shadow-lg transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {getIcon(issue.type)}
                                <span className="font-medium text-sm">
                                  {issue.title}
                                </span>
                              </div>

                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                {issue.type.toUpperCase()}
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
    </div>
  );
}
