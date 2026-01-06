// BacklogModal.jsx
import React, { useEffect, useState } from "react";
import {
  X,
  SaveAll,
  RotateCcw,
  Link2,
  Plus,
  Undo2,
  Paperclip,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  updateIssue,
  getLinksByIssueId,
  getAllIssues,
  postTags,
  getSprint,
  deleteComments,
  getSingleIssues,
} from "../API/projectAPI";
import { deleteLinkById } from "../API/LinkedItems";
import ParentPickerModal from "./ParentPickerModal";

const BacklogModal = ({
  modalIssue,
  setModalIssue,
  users,
  issueComments,
  newComment,
  setNewComment,
  handleAddComment,
  project,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [issueForm, setIssueForm] = useState({});
  const [originalIssue, setOriginalIssue] = useState(null);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [linkedParents, setLinkedParents] = useState([]);

  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [sprints, setSprints] = useState([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!modalIssue || !project?.id) return;

    const snapshot = {
      name: modalIssue.name || "",
      description: modalIssue.description || "",
      priority: modalIssue.priority || "",
      start_date: modalIssue.start_date || "",
      target_date: modalIssue.target_date || "",
      story_points: modalIssue.story_points ?? null,
      estimated_hours: modalIssue.estimated_hours ?? null,
      status: modalIssue.status || "",
      assignee_id: modalIssue.assignee_id ?? null,
      sprint_id: modalIssue.sprint_id ?? "",
      parent_ids:
        modalIssue.parent_ids ||
        (modalIssue.parent_id ? [modalIssue.parent_id] : []),
    };

    setIssueForm(structuredClone(snapshot));
    setOriginalIssue(structuredClone(snapshot));
    fetchLinkedParents();
    fetchSprints();
  }, [modalIssue?.id, project?.id]);

  const fetchSprints = async () => {
    if (!project?.id) return;

    try {
      const data = await getSprint(project.id);
      setSprints(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sprints");
    }
  };

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
          parentType = mapType(link.source_type); // fallback mapping
        } else {
          parentId = link.target_id;
          parentType = mapType(link.target_type); // fallback mapping
        }

        const parentIssue = allIssues.find((i) => i.id === parentId);

        return {
          id: link.id,
          parent_id: parentId,
          parent_type: parentType, // safe
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
      "project",
      "epic",
      "sprint",
      "story",
      "task",
      "bug",
      "subtask",
      "feature",
    ];
    return allowed.includes(t) ? t : "task";
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
        issueForm.story_points !== null ? Number(issueForm.story_points) : null,
      estimated_hours:
        issueForm.estimated_hours !== null
          ? Number(issueForm.estimated_hours)
          : null,
    };
    if (!issueForm.sprint_id) {
      delete payload.sprint_id; // 🚀 backend ku field-eh pogathu
    }

    try {
      const updatedIssue = await updateIssue(modalIssue.id, payload); // 🔥 capture API response
      toast.success(
        `"${
          updatedIssue.type.charAt(0).toUpperCase() + updatedIssue.type.slice(1)
        }" updated successfully!`
      );

      setOriginalIssue(structuredClone(payload));
      setModalIssue(null);
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

  const handleRemoveTag = async (tagToRemove) => {
    const currentTags = Array.isArray(modalIssue.tags)
      ? modalIssue.tags
      : modalIssue.tags
      ? [modalIssue.tags]
      : [];

    const updatedTags = currentTags.filter((t) => t !== tagToRemove);

    const payload = {
      assignee_id: issueForm.assignee_id || null,
      tags: updatedTags, // 🔥 empty array pogum if last tag removed
    };

    try {
      await postTags(modalIssue.id, payload);
      toast.success("Tag removed");

      // UI update
      setModalIssue((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove tag");
    }
  };

  

const handleDeleteComment = async (commentId) => {
  if (!window.confirm("Delete this comment?")) return;

  try {
    await deleteComments(commentId);
    toast.success("Comment deleted");

    // 🔥 UI update – parent state la irundhu remove pannum
    setModalIssue((prev) => ({
      ...prev,
      comments: prev.comments?.filter((c) => c.id !== commentId),
    }));
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete comment");
  }
};

  const storyPointsOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

  if (!modalIssue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-[90vw] h-[90vh] flex flex-col transition-all duration-300">
        {/* ================= HEADER ================= */}
        <div className="px-6 py-4 flex justify-between items-start shadow-sm">
          <div>
            <p className="text-lg font-semibold text-orange-600">
              {modalIssue.type?.toUpperCase()}
            </p>
            <p className="mr-4 text-gray-400">ID : {modalIssue.tableIndex}</p>

            {!isEditingTitle ? (
              <h2
                className="text-2xl font-semibold cursor-pointer hover:text-blue-600 transition"
                onClick={() => setIsEditingTitle(true)}
              >
                {issueForm.name}
              </h2>
            ) : (
              <input
                className="text-2xl font-semibold px-3 py-1 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
                value={issueForm.name}
                onChange={(e) => handleUpdate("name", e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
              />
            )}
          </div>

          <div className="flex gap-4 items-center">
           

            <button
              onClick={handleRestoreIssue}
              className="hover:scale-110 transition"
              title="Undo"
            >
              <Undo2 />
            </button>

            <button
              title="Save Changes"
              onClick={handleSaveIssue}
              className="bg-blue-600 px-4 py-2 rounded flex items-center text-white gap-2 shadow-lg hover:bg-blue-700 transition"
            >
              <SaveAll size={18} /> Save
            </button>

            <button
              title="Close"
              onClick={() => setModalIssue(null)}
              className="text-red-600 hover:scale-110 transition"
            >
              <X size={26} />
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-6">
          {/* ================= LEFT ================= */}
          <div className="col-span-2 space-y-4">
            <div className="flex gap-3 justify-between">
              <div className="flex gap-3 items-center">
                {/* SPRINT */}
                <div className="flex gap-3 items-center">
                  <label className="text-md font-semibold">Sprint</label>
                  <select
                    className="w-full px-3 py-1 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
                    value={issueForm.sprint_id || ""}
                    onChange={(e) =>
                      handleUpdate(
                        "sprint_id",
                        e.target.value === "" ? undefined : e.target.value
                      )
                    }
                  >
                    <option value="">No Sprint</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowTagModal(true)}
                  className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full shadow-sm hover:bg-blue-100 transition"
                >
                  <Plus size={14} /> Add Tags
                </button>
                {/* TAGS */}
                {modalIssue.tags && (
                  <div className="flex gap-2 flex-wrap">
                    {(Array.isArray(modalIssue.tags)
                      ? modalIssue.tags
                      : [modalIssue.tags]
                    ).map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1 bg-white shadow-sm text-gray-700 px-3 py-1 rounded-full text-xs"
                      >
                        {t}
                        <button
                          onClick={() => handleRemoveTag(t)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-row items-center gap-3">
                <p>Assignee:</p>
                <select
                  className="w-full px-3 py-1 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
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
            </div>

            {showTagModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                  <h3 className="text-lg font-bold mb-4">
                    Add Tags & Assignee
                  </h3>{" "}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm block mb-1">
                        Select Assignee
                      </label>
                      <select
                        className="w-full border p-2 rounded"
                        value={issueForm.assignee_id || ""}
                        onChange={(e) =>
                          handleUpdate("assignee_id", e.target.value)
                        }
                      >
                        {" "}
                        <option value="">Select User</option>
                        {users?.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm block mb-1">
                        Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. uiux, bug, api"
                        className="w-full border p-2 rounded"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowTagModal(false)}
                      className="px-4 py-2 text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // 🔹 1. existing tags
                        const existingTags = Array.isArray(modalIssue.tags)
                          ? modalIssue.tags
                          : modalIssue.tags
                          ? [modalIssue.tags]
                          : [];

                        // 🔹 2. new tags from input
                        const newTags = tagInput
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t !== "");

                        // 🔹 3. merge + remove duplicates
                        const mergedTags = [
                          ...new Set([...existingTags, ...newTags]),
                        ];

                        const payload = {
                          assignee_id: issueForm.assignee_id || null,
                          tags: mergedTags,
                        };

                        try {
                          await postTags(modalIssue.id, payload);
                          toast.success("Tags updated!");

                          // 🔹 UI update
                          setModalIssue((prev) => ({
                            ...prev,
                            tags: mergedTags,
                          }));

                          setTagInput("");
                          setShowTagModal(false);
                        } catch (err) {
                          toast.error("Failed to update tags");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                    >
                      Apply & Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DESCRIPTION */}

            <div>
              <h3 className="font-semibold mb-2">Description</h3>

              {!isEditingDescription ? (
                <p
                  onClick={() => setIsEditingDescription(true)}
                  className="bg-white p-4 rounded shadow-md text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  {issueForm.description || "Click to add description"}
                </p>
              ) : (
                <textarea
                  className="w-full min-h-[120px] p-4 rounded shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
                  value={issueForm.description}
                  onChange={(e) => handleUpdate("description", e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  autoFocus
                />
              )}
            </div>

            {/* STATUS */}
            <div className="flex gap-2 items-center">
              <span className="text-gray-500">Status :</span>
              <span className="font-medium capitalize bg-white px-3 py-1 rounded-full shadow-sm">
                {issueForm.status}
              </span>
            </div>

            {/* COMMENTS HEADER */}
            <div className="flex justify-between mt-4">
              <h3 className="font-semibold">
                Comments :{" "}
                <span className="text-blue-600">
                  {issueComments?.length || 0}
                </span>
              </h3>
              <p className="text-gray-400 text-sm"></p>
            </div>

            {/* COMMENTS LIST */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {issueComments?.length === 0 ? (
                <p className="text-gray-400 text-sm">No comments yet</p>
              ) : (
                issueComments.map((c) => (
                  <div key={c.id} className="bg-white p-3 rounded shadow-sm">
                    <p className="capitalize">{c.comment}</p>
                    <div className=" flex  justify-between items-center">
                      <p className="text-xs flex flex-col text-gray-500">
                        {new Date(c.created_at).toLocaleString()}

                        <span className="text-[12px] font-bold">
                          {c.author_name}
                        </span>
                      </p>

                      <div>
                       <button
  onClick={() => handleDeleteComment(c.id)}
  className="text-red-600 cursor-pointer hover:scale-110 transition"
  title="Delete comment"
>
  <Trash2 size={14} />
</button>

                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ADD COMMENT */}
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-2 rounded shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
                value={newComment || ""}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-600 text-white px-5 rounded shadow-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="bg-white p-5 rounded shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Planning</h4>
              <div>
                <button className="cursor-pointer" title="Attachments">
                  <Paperclip size={16} />
                </button>
              </div>
            </div>

            {/* PRIORITY */}
            <div>
              <label className="text-xs">Priority</label>
              <select
                className="w-full px-3 py-2 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
                value={issueForm.priority}
                onChange={(e) => handleUpdate("priority", e.target.value)}
              >
                {["highest", "high", "medium", "low", "lowest"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* ASSIGNEE */}

            {/* ESTIMATED HOURS */}
            <div>
              <label className="text-xs">Estimated Hours</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
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
                  className="w-full px-3 py-2 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 outline-none mt-1"
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
                <div className="mt-2 space-y-2">
                  {linkedParents.map((link) => (
                    <div
                      key={link.id}
                      className="flex justify-between bg-white shadow-sm rounded-xl px-3 py-2"
                    >
                      <span className="text-sm">{link.parent_name}</span>
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
                onClick={() => setShowParentPicker(true)}
                className="flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
              >
                <Link2 size={14} /> Add parent link
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
