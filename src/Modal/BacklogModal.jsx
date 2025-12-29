import React, { useEffect, useState } from "react";
import { X, SaveAll, RotateCcw, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateIssue } from "../API/ProjectAPI";
import ParentPickerModal from "./ParentPickerModal";

const BacklogModal = ({
  modalIssue,
  setModalIssue,
  users,
  issueComments,
  newComment,
  setNewComment,
  handleAddComment,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [issueForm, setIssueForm] = useState({});
  const [originalIssue, setOriginalIssue] = useState(null);
  const [showParentPicker, setShowParentPicker] = useState(false);


  /* ================= INIT ================= */
  useEffect(() => {
    if (!modalIssue) return;

    const snapshot = {
      name: modalIssue.name || "",
      priority: modalIssue.priority || "",
      start_date: modalIssue.start_date || "",
      target_date: modalIssue.target_date || "",
      story_points: modalIssue.story_points ?? null,
      status: modalIssue.status || "",
      assignee_id: modalIssue.assignee_id ?? null,
      parent_id: modalIssue.parent_id ?? null, // 👈 parent link
    };

    setIssueForm(structuredClone(snapshot));
    setOriginalIssue(structuredClone(snapshot));
  }, [modalIssue]);

  /* ================= HANDLERS ================= */
  const handleUpdate = (field, value) => {
    setIssueForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveIssue = async () => {
    if (!window.confirm("Do you want to save changes?")) return;

    const payload = {
      ...issueForm,
      assignee_id: issueForm.assignee_id || null,
      parent_id: issueForm.parent_id || null,
      story_points:
        issueForm.story_points !== null
          ? Number(issueForm.story_points)
          : null,
    };

    try {
      await updateIssue(modalIssue.id, payload);

      setModalIssue((prev) => ({ ...prev, ...payload }));
      setOriginalIssue(structuredClone(payload));

      toast.success("Issue updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save issue");
    }
  };
  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];


  const handleRestoreIssue = () => {
    if (!originalIssue) return;
    if (!window.confirm("Undo all changes?")) return;

    const restored = structuredClone(originalIssue);
    setIssueForm(restored);
    setModalIssue((prev) => ({ ...prev, ...restored }));

    toast("Changes restored", { icon: "↩️" });
  };

  if (!modalIssue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col">
        {/* ================= HEADER ================= */}
        <div className="px-6 py-4 flex justify-between items-start border-b">
          <div>
            <p className="text-lg font-semibold text-orange-600">
              {modalIssue.type?.toUpperCase()}
            </p>

            {!isEditingTitle ? (
              <h2
                className="text-2xl font-semibold cursor-pointer"
                onClick={() => setIsEditingTitle(true)}
              >
                {issueForm.name}
              </h2>
            ) : (
              <input
                className="text-2xl font-semibold border rounded px-2 py-1"
                value={issueForm.name}
                onChange={(e) => handleUpdate("name", e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
              />
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={handleRestoreIssue}><RotateCcw /></button>
            <button onClick={handleSaveIssue}><SaveAll /></button>
            <button onClick={() => setModalIssue(null)}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="bg-gray-50 p-4 rounded">
              {modalIssue.description || "No description"}
            </p>

            <h3 className="font-semibold mt-6">
              Discussion ({issueComments.length})
            </h3>

            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded px-3 py-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-600 text-white px-4 rounded"
              >
                Add
              </button>
            </div>
          </div>

          {/* RIGHT – PLANNING */}
          <div className="bg-gray-50 p-4 rounded space-y-4">
            <h4 className="font-semibold">Planning</h4>

            {/* Priority */}
            <div>
              <label className="text-xs">Priority</label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={issueForm.priority}
                onChange={(e) =>
                  handleUpdate("priority", e.target.value)
                }
              >
                {["highest", "high", "medium", "low", "lowest"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs">Start Date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1 mt-1"
                value={issueForm.start_date || ""}
                onChange={(e) =>
                  handleUpdate("start_date", e.target.value)
                }
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="text-xs">Target Date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1 mt-1"
                value={issueForm.target_date || ""}
                onChange={(e) =>
                  handleUpdate("target_date", e.target.value)
                }
              />
            </div>

            {/* Story Points – only for story */}
            {modalIssue.type === "story" && (
  <div>
    <label className="text-xs">Story Points</label>
    <select
      className="w-full border rounded px-2 py-1 mt-1"
      value={issueForm.story_points ?? ""}
      onChange={(e) =>
        handleUpdate(
          "story_points",
          e.target.value === "" ? null : Number(e.target.value)
        )
      }
    >
      <option value="">Select points</option>
      {storyPointsOptions.map((point) => (
        <option key={point} value={point}>
          {point}
        </option>
      ))}
    </select>
  </div>
)}


            {/* RELATED WORK – PARENT */}
            {/* RELATED WORK – PARENT */}
<div>
  <label className="text-xs">Related Work</label>

  {issueForm.parent_id ? (
    <div className="flex items-center justify-between bg-white border rounded px-2 py-1 mt-1">
      <span className="text-sm">
        Parent ID: {issueForm.parent_id}
      </span>
      <button
        onClick={() => handleUpdate("parent_id", null)}
        className="text-red-500 text-xs"
      >
        Remove
      </button>
    </div>
  ) : (
    <button
      className="flex items-center gap-1 text-blue-600 text-sm mt-1"
      onClick={() => setShowParentPicker(true)}
    >
      <Link2 size={14} />
      Add parent link
    </button>
  )}
</div>

          </div>
        </div>
      </div>
      {showParentPicker && (
  <ParentPickerModal
    issue={modalIssue}
    onClose={() => setShowParentPicker(false)}
    onLinked={(parent) =>
      handleUpdate("parent_id", parent.id)
    }
  />
)}

    </div>
  );
};

export default BacklogModal;
