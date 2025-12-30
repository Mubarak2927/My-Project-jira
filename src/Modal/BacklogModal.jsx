// BacklogModal.jsx
import React, { useEffect, useState } from "react";
import { X, SaveAll, RotateCcw, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateIssue,
  deleteLinkById,
  getLinksByIssueId,
  getAllIssues,
} from "../API/projectAPI";
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
  const [linkedParents, setLinkedParents] = useState([]);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!modalIssue) return;

    const snapshot = {
      name: modalIssue.name || "",
      priority: modalIssue.priority || "",
      start_date: modalIssue.start_date || "",
      target_date: modalIssue.target_date || "",
      story_points: modalIssue.story_points ?? null,
      estimated_hours: modalIssue.estimated_hours ?? null,
      status: modalIssue.status || "",
      assignee_id: modalIssue.assignee_id ?? null,
      parent_ids:
        modalIssue.parent_ids ||
        (modalIssue.parent_id ? [modalIssue.parent_id] : []),
    };

    setIssueForm(structuredClone(snapshot));
    setOriginalIssue(structuredClone(snapshot));
    fetchLinkedParents();
  }, [modalIssue?.id]);

  /* ================= FETCH LINKED PARENTS ================= */
  const fetchLinkedParents = async () => {
    if (!modalIssue) return;

    try {
      const links = await getLinksByIssueId(modalIssue.id);
      const allIssues = await getAllIssues(modalIssue.project_id);

      const parentDetails = links.map((link) => {
  let parentId, parentType;

  if (link.target_id === modalIssue.id) {
    parentId = link.source_id;
    parentType = mapType(link.source_type);  // fallback mapping
  } else {
    parentId = link.target_id;
    parentType = mapType(link.target_type);  // fallback mapping
  }

  const parentIssue = allIssues.find((i) => i.id === parentId);

  return {
    id: link.id,
    parent_id: parentId,
    parent_type: parentType,             // safe
    parent_name: parentIssue?.name || "Unknown",
  };
});


      setLinkedParents(parentDetails);

      if (parentDetails.length > 0) {
        setIssueForm((prev) => ({
          ...prev,
          parent_ids: parentDetails.map((p) => p.parent_id),
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch linked parents");
    }
  };
  /* ================== HELPER – MAP TYPE ================== */
const mapType = (type) => {
  if (!type) return "task";
  const t = type.toLowerCase();
  const allowed = [
    "project","epic","sprint","story","task","bug","subtask","feature"
  ];
  return allowed.includes(t) ? t : "task"; // fallback if "issue"
};


  /* ================= HANDLERS ================= */
  const handleUpdate = (field, value) => {
    setIssueForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveIssue = async () => {
  if (!window.confirm("Do you want to save changes?")) return;

  const payload = {
    ...issueForm,
    assignee_id: issueForm.assignee_id || null,
    parent_ids: issueForm.parent_ids || [],
    story_points:
      issueForm.story_points !== null
        ? Number(issueForm.story_points)
        : null,
    estimated_hours:
      issueForm.estimated_hours !== null
        ? Number(issueForm.estimated_hours)
        : null,
  };

  try {
    await updateIssue(modalIssue.id, payload);
    toast.success("Issue updated successfully");

    // Update the snapshot after saving, so "Restore" works correctly
    setOriginalIssue(structuredClone(payload));

    // Optional: close modal automatically
    // setModalIssue(null);

  } catch (err) {
    console.error(err);
    toast.error("Failed to update issue");
  }
};

const handleRestoreIssue = () => {
  if (!originalIssue) return;
  if (!window.confirm("Undo all changes?")) return;

  const restored = structuredClone(originalIssue);
  setIssueForm(restored);
  setModalIssue((prev) => ({ ...prev, ...restored }));

  toast("Changes restored", { icon: "↩️" });
};

  const handleRemoveParentLink = async (linkId) => {
    if (!window.confirm("Remove this parent link?")) return;

    try {
      await deleteLinkById(linkId);
      toast.success("Parent link removed");
      fetchLinkedParents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove parent link");
    }
  };

  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

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

          <div className="flex gap-5">
            <button onClick={handleRestoreIssue}>
              <RotateCcw />
            </button>
            <button
              onClick={handleSaveIssue}
              className="bg-blue-500 p-1 rounded-xl flex items-center text-white gap-2"
            >
              <SaveAll size={18} /> Save
            </button>
            <button onClick={() => setModalIssue(null)} className="text-red-600">
              <X size={25} />
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

            <div className="flex gap-3 items-center mt-4">
              <span className="text-gray-500">Status :</span>
              <span className="font-medium capitalize">
                {issueForm.status}
              </span>
            </div>

            {/* COMMENTS */}
            <div className="flex justify-between mt-6">
              <h3 className="font-semibold">Comments</h3>
              <p className="text-gray-400">
                Total Comments :{" "}
                <span className="text-blue-600">
                  {issueComments?.length || 0}
                </span>
              </p>
            </div>

            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {issueComments?.length === 0 ? (
                <p className="text-gray-400 text-sm">No comments yet</p>
              ) : (
                issueComments.map((c) => (
                  <div key={c.id} className="bg-gray-100 p-2 rounded">
                    <p className="text-sm font-semibold">{c.author_name}</p>
                    <p className="text-sm">{c.comment}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded px-3 py-2"
                value={newComment || ""}
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

            {/* PRIORITY */}
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
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ ASSIGNEE (EMPLOYEE) */}
            <div>
              <label className="text-xs">Assignee</label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={issueForm.assignee_id || ""}
                onChange={(e) =>
                  handleUpdate(
                    "assignee_id",
                    e.target.value === "" ? null : e.target.value
                  )
                }
              >
                <option value="">Unassigned</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* ESTIMATED HOURS */}
            <div>
              <label className="text-xs">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full border rounded px-2 py-1 mt-1"
                value={issueForm.estimated_hours ?? ""}
                onChange={(e) =>
                  handleUpdate(
                    "estimated_hours",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>

            {/* STORY POINTS */}
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
                  {storyPointsOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* RELATED WORK */}
            <div>
              <label className="text-xs">Related Work</label>

              {linkedParents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {linkedParents.map((link) => (
                    <div
                      key={link.id}
                      className="flex justify-between bg-gray-100 border rounded px-2 py-1"
                    >
                      <span className="text-sm">
                        {link.parent_name}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveParentLink(link.id)
                        }
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowParentPicker(true)}
                className="flex items-center gap-1 text-blue-600 text-sm mt-2"
              >
                <Link2 size={14} />
                Add parent link
              </button>
            </div>
          </div>
        </div>
      </div>

      {showParentPicker && (
        <ParentPickerModal
          issue={modalIssue}
          onClose={() => setShowParentPicker(false)}
          onLinked={fetchLinkedParents}
        />
      )}
    </div>
  );
};

export default BacklogModal;
