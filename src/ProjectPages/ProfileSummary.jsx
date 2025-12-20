import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, MessageSquarePlus, X } from "lucide-react";
import { getProjectComments, ProjectComments } from "../API/ProjectAPI";

const ProjectSummary = () => {
  const { project } = useOutletContext();

  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Load comments
  useEffect(() => {
    fetchComments();
  }, [project?.id]);

  const fetchComments = async () => {
    try {
      const res = await getProjectComments(project.id);
      setComments(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await ProjectComments(project.id, newComment);
      setNewComment("");
      setShowModal(false);
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* ================= Project Card ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-purple-600" />
        <div className="px-8 py-7">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Project Name</p>
            <p className="text-2xl font-semibold capitalize text-gray-900">{project.name}</p>
          </div>
          <div className="h-px bg-gray-200 my-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Project Key</p>
              <p className="font-mono text-sm uppercase">{project.key}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{project.description || "No description provided"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Comments Section ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-cyan-400" />
        <div className="px-8 py-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <MessageSquarePlus size={16} />
              Add Comment
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex justify-between gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-800 text-sm leading-relaxed">
                    <p>{c.comment}</p>
                    <p className="text-blue-600">{c.author_name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ================= Modal ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
            <textarea
              rows="4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full rounded-xl border p-3 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />
            <button
              onClick={handleAddComment}
              disabled={loading}
              className="w-full px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? "Adding..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectSummary;
