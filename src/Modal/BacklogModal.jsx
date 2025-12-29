// BacklogModal.jsx
import React, { useEffect, useState } from "react";
import { X, SaveAll, RotateCcw, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { 
  updateIssue, 
  deleteLinkById, 
  getLinksByIssueId, 
  getAllIssues 
} from '../API/projectAPI'
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

  /* ================= INIT & FETCH LINKED PARENTS ================= */
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
      parent_ids: modalIssue.parent_ids || (modalIssue.parent_id ? [modalIssue.parent_id] : []),
    };

    setIssueForm(structuredClone(snapshot));
    setOriginalIssue(structuredClone(snapshot));

    // ✅ Fetch linked parents whenever modal opens
    fetchLinkedParents();
  }, [modalIssue?.id]);

  /* ================= FETCH LINKED PARENTS WITH NAMES ================= */
  const fetchLinkedParents = async () => {
    if (!modalIssue) return;

    try {
      const links = await getLinksByIssueId(modalIssue.id);

      // Fetch all issues in project to get names
      const allIssues = await getAllIssues(modalIssue.project_id);

      const parentDetails = links.map((link) => {
        let parentId, parentType;

        // Determine which side is the parent
        if (link.target_id === modalIssue.id) {
          parentId = link.source_id;
          parentType = link.source_type;
        } else {
          parentId = link.target_id;
          parentType = link.target_type;
        }

        const parentIssue = allIssues.find((i) => i.id === parentId);

        return {
          id: link.id, // link ID
          parent_id: parentId,
          parent_type: parentType,
          parent_name: parentIssue?.name || "Unknown",
        };
      });

      setLinkedParents(parentDetails);

      // Update form parent_ids with API-linked parents
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
      setModalIssue(null);
    } catch (err) {
      console.error(err);
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
                {issueForm.name || ""}
              </h2>
            ) : (
              <input
                className="text-2xl font-semibold border rounded px-2 py-1"
                value={issueForm.name || ""}
                onChange={(e) => handleUpdate("name", e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
              />
            )}
          </div>

          <div className="flex gap-5">
            <button title="Undo" className="cursor-pointer" onClick={handleRestoreIssue}>
              <RotateCcw />
            </button>
            <button
              title="Save"
              className="bg-blue-500 cursor-pointer p-1 flex rounded-xl items-center text-white gap-2"
              onClick={handleSaveIssue}
            >
              <SaveAll size={18} />Save
            </button>
            <button
              title="Cancel"
              className="cursor-pointer text-red-600"
              onClick={() => setModalIssue(null)}
            >
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

            <h3 className="font-semibold mt-6">
              Discussion ({issueComments?.length || 0})
            </h3>

            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {(!issueComments || issueComments.length === 0) ? (
                <p className="text-gray-400 text-sm">No comments yet</p>
              ) : (
                issueComments.map((c) => (
                  <div key={c.id} className="bg-gray-100 p-2 rounded">
                    <p className="text-sm font-semibold">{c.author_name}</p>
                    <p className="text-sm">{c.comment}</p>
                    <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</p>
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

            {/* Priority */}
            <div>
              <label className="text-xs">Priority</label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={issueForm.priority || ""}
                onChange={(e) => handleUpdate("priority", e.target.value)}
              >
                {["highest", "high", "medium", "low", "lowest"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

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

            {/* RELATED WORK – MULTIPLE PARENTS */}
            <div>
              <label className="text-xs">Related Work</label>

              {/* Existing parent IDs (temporary display) */}
              {(issueForm.parent_ids || []).length > 0 && (
                <div className="space-y-1 mt-1">
                  {(issueForm.parent_ids || []).map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between  rounded px-2 py-1"
                    >
                      {/* <span className="text-sm">Parent ID: {id}</span> */}
                      {/* <button
                        onClick={() => {
                          const updatedParents = (issueForm.parent_ids || []).filter(
                            (pid) => pid !== id
                          );
                          setIssueForm((prev) => ({ ...prev, parent_ids: updatedParents }));
                          setModalIssue((prev) => ({ ...prev, parent_ids: updatedParents }));
                        }}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button> */}
                    </div>
                  ))}
                </div>
              )}

              {/* API-linked parents WITH NAMES */}
              {linkedParents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {linkedParents.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between bg-gray-100 border rounded px-2 py-1"
                    >
                      <span className="text-sm">{link.parent_name} </span>
                      {/* <span>({link.parent_type})</span> */}
                      <button
                        onClick={() => handleRemoveParentLink(link.id)}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="flex items-center gap-1 text-blue-600 text-sm mt-1"
                onClick={() => setShowParentPicker(true)}
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
          onLinked={() => fetchLinkedParents()}
        />
      )}
    </div>
  );
};

export default BacklogModal;
