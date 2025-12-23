import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bug, BookOpen, CheckSquare, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { addColumnToBoard, completeSprint, getBoardByProjectId, getRunningSprints, sprintTaskMoveColumn } from "../API/projectAPI";
import toast from "react-hot-toast";

/* ---------- ICON ---------- */
const getIcon = (type) => {
  if (type === "bug") return <Bug className="text-red-500 w-4 h-4" />;
  if (type === "story") return <BookOpen className="text-blue-500 w-4 h-4" />;
  return <CheckSquare className="text-green-500 w-4 h-4" />;
};

export default function JiraBoard() {
  const { projectId } = useParams();

  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- MODAL STATE ---------- */
  const [showModal, setShowModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnPosition, setNewColumnPosition] = useState(0);

  /* ---------- LOAD BOARD ---------- */
  useEffect(() => {
    if (!projectId) return;
    loadBoard();
  }, [projectId]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const res = await getBoardByProjectId(projectId);
      let boardColumns = res?.columns?.board?.columns || [];

      // Ensure all columns have column_info
      boardColumns = boardColumns.map(col => ({
        ...col,
        column_info: col.column_info || {
          id: col.id,
          name: col.name,
          status: col.status || col.name,
        },
        issues: col.issues || [],
      }));

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
      await sprintTaskMoveColumn(draggableId, { status: destCol.column_info.status });

      const updated = columns.map((col) => {
        if (col.column_info.id === sourceCol.column_info.id) {
          return { ...col, issues: col.issues.filter((i) => i.id !== draggableId) };
        }
        if (col.column_info.id === destCol.column_info.id) {
          return { ...col, issues: [...col.issues, { ...movedIssue, status: destCol.column_info.status }] };
        }
        return col;
      });

      setColumns(updated);
    } catch (err) {
      console.error("Issue move failed", err);
    }
  };

  /* ---------- ADD COLUMN ---------- */
  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const columnData = {
        name: newColumnName,
        status: newColumnName,        // use column name as status
        position: newColumnPosition,  // user-selected position
      };

      const res = await addColumnToBoard(projectId, columnData);

      if (res?.column) {
        let newCol = res.column;

        // Ensure column_info exists
        if (!newCol.column_info) {
          newCol.column_info = {
            id: newCol.id,
            name: newCol.name,
            status: newCol.status || newCol.name,
          };
        }
        newCol.issues = newCol.issues || [];

        // Insert at user-specified position
        const updatedColumns = [...columns];
        updatedColumns.splice(newColumnPosition, 0, newCol);
        setColumns(updatedColumns);

        setNewColumnName("");
        setNewColumnPosition(columns.length);
        setShowModal(false);
        toast.success(`Column ${newCol.name} added Sucessfully`)
      }
    } catch (err) {
      console.error("Failed to add column", err);
    }
  };
  const fetchRunningSprints = async () => {
  try {
    if (!projectId) return;

    const res = await getRunningSprints(projectId);
    console.log("Running Sprints:", res);
  } catch (error) {
    console.error("Failed to fetch running sprints:", error);
  }
};
useEffect(() => {
    fetchRunningSprints();
  }, []);


  const isDoneColumn = (status) =>
  status?.toLowerCase() === "done";
  
const handleCompleteSprint = async () => {
  try {
    if (!projectId) return toast.error("No project selected");

    // 1️⃣ Get running sprint
    const res = await getRunningSprints(projectId);
    const sprintId = res?.sprints?.[0]?.sprint_id;

    if (!sprintId) {
      return toast.error("No active sprint found!");
    }

    // 2️⃣ Collect DONE & NOT DONE issues
    const doneIssueIds = [];
    const notDoneIssueIds = [];

    columns.forEach((col) => {
      col.issues.forEach((issue) => {
        if (isDoneColumn(col.column_info.status)) {
          doneIssueIds.push(issue.id);
        } else {
          notDoneIssueIds.push(issue.id);
        }
      });
    });

    // 3️⃣ SINGLE backend call (IMPORTANT)
    await completeSprint(sprintId, {
      completed_issue_ids: doneIssueIds,
      return_to_backlog_issue_ids: notDoneIssueIds,
    });

    // 4️⃣ Reload board
    await loadBoard();

    toast.success("Sprint completed successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to complete sprint!");
  }
};



  return (
    <div className="p-6 bg-gray-100  mt-10 rounded-lg h-full flex flex-col">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between gap-3 mb-6">
        <h1 className="text-lg text-gray-400">
          Board
        </h1>
        <div className="flex gap-5">
          <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 shadow-sm/20 text-blue-600 hover:bg-gray-200 hover:scale-104 cursor-pointer transition rounded-lg"
        >
          + Add Column
        </button>
        <button
  onClick={handleCompleteSprint}
  className="cursor-pointer text-white bg-green-500 hover:bg-green-600 px-2 py-2 rounded-lg"
>
  Complete Sprint
</button>


        </div>
        
      </div>

      {/* ---------- ADD COLUMN MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <h2 className="text-lg font-semibold mb-4">Add Column</h2>

            {/* Column Name */}
            <input
              type="text"
              placeholder="Column Name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            />

            {/* Column Position */}
            <input
              type="number"
              placeholder="Position (0-based)"
              value={newColumnPosition}
              onChange={(e) => setNewColumnPosition(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded mb-4"
              min={0}
              max={columns.length}
            />

            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 mt-20">Loading board...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto">
            {columns
              .filter(col => col.column_info) // prevent undefined error
              .map((col) => (
              <Droppable key={col.column_info.id} droppableId={col.column_info.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-200 rounded-2xl p-4 w-full h-[59vh] flex flex-col shadow-md"
                  >
                    <h2 className="text-gray-700 font-semibold mb-4">
                      {col.column_info.name}
                    </h2>

                    <div className="space-y-3 flex-1 h-[30vh] overflow-y-auto">
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
