import React, { useState } from "react";
import { EllipsisVertical, Plus, Trash2, X } from "lucide-react";
import { getEpicComments, epicComments } from "../API/projectAPI";

const Epic = ({
  onCreate,
  epics,
  selectedEpic,
  onSelectEpic,
  onDeleteEpic,
  onEditEpic,
  // ✅ NEW
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  // 🔥 Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEpic, setEditEpic] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewEpic, setViewEpic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onCreate({
      name,
      description: description || "No description",
    });

    setName("");
    setDescription("");
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDeleteEpic(id);
    setOpenMenuId(null);
  };

  // ================= EDIT =================
  const openEditModal = (e, epic) => {
    e.stopPropagation();
    setEditEpic(epic);
    setEditName(epic.name);
    setEditDescription(epic.description);
    setEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return;

    await onEditEpic(editEpic.id, {
      name: editName,
      description: editDescription,
    });

    setEditModalOpen(false);
    setEditEpic(null);
  };

  const openViewDetails = async (e, epic) => {
    e.stopPropagation();
    setViewEpic(epic);
    setDetailsModalOpen(true);
    setOpenMenuId(null);

    try {
      const res = await getEpicComments(epic.id);
      setComments(res || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !viewEpic) return;

    try {
      await epicComments(viewEpic.id, newComment);

      const res = await getEpicComments(viewEpic.id);
      setComments(res || []);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  return (
    <>
      <div className="shadow-md/50 bg-gray-100 p-4 rounded-xl max-w-md h-[73vh] space-y-4">
        {/* ================= CREATE EPIC ================= */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Create Epic</h2>

          <input
            type="text"
            placeholder="Epic name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-2 px-3 py-2 shadow-md/20 outline-none rounded-lg"
          />

          <textarea
            placeholder="Epic description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mb-3 px-3 py-2 shadow-md/20 outline-none rounded-lg"
          />

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gray-100 shadow-sm/40 text-blue-700 hover:scale-105 transition cursor-pointer px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
            Add Epic
          </button>
        </div>

        {/* ================= EPIC LIST ================= */}
        <div className="space-y-2 h-[31vh] overflow-y-auto">
          {epics.length === 0 && (
            <p className="text-sm text-gray-500">No epics yet</p>
          )}

          {epics.map((epic) => (
            <div
              key={epic.id}
              onClick={() => onSelectEpic(epic)}
              className={`relative p-3 rounded-lg cursor-pointer
                ${
                  selectedEpic?.id === epic.id
                    ? "shadow-md/30 bg-gray-300"
                    : "bg-gray-50"
                }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{epic.name}</h4>
                  <p className="text-sm text-gray-600">{epic.description}</p>
                </div>

                <div className="relative">
                  <EllipsisVertical
                    size={15}
                    className="cursor-pointer"
                    onClick={(e) => toggleMenu(e, epic.id)}
                  />

                  {openMenuId === epic.id && (
                    <div className="absolute right-0 top-5 bg-white shadow-md rounded-lg z-20">
                      <button
                        onClick={(e) => openEditModal(e, epic)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => openViewDetails(e, epic)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        View Details
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, epic.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                  {detailsModalOpen && viewEpic && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                      <div className="bg-white w-[450px] rounded-xl p-5 space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">
                            Epic Details
                          </h3>
                          <X
                            className="cursor-pointer"
                            onClick={() => setDetailsModalOpen(false)}
                          />
                        </div>

                        {/* Epic Info */}
                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-800">
                            {viewEpic.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {viewEpic.description}
                          </p>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          <h5 className="font-medium text-sm">Comments</h5>

                          {comments.length === 0 && (
                            <p className="text-xs text-gray-400">
                              No comments yet
                            </p>
                          )}

                          {comments.map((c, index) => (
                            <div
                              key={c.id || index}
                              className="bg-gray-100 px-3 flex justify-between py-2 rounded-lg text-sm"
                            >
                              <p>{c.comment}</p>
                              <p>{c.author_name}</p>
                            </div>
                          ))}
                        </div>

                        {/* Add Comment */}
                        <div className="space-y-2">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />

                          <button
                            onClick={handleAddComment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Epic</h3>
              <X
                className="cursor-pointer"
                onClick={() => setEditModalOpen(false)}
              />
            </div>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Epic name"
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Epic description"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Epic;
