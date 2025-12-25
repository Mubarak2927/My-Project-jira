import React, { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import {
  createEpic,
  getEpic,
  getIssues,
  createIssues,
  sprintTaskMove,
  deleteEpic,
  updateEpic,
  getEpicComments,
  epicComments,
  getIssueComments,
  updateIssue,
  IssueComments,
  deleteIssues, // ✅ ADD THIS API
} from "../API/projectAPI";
import toast, { Toaster } from "react-hot-toast";
import Backlog from "./Backlog";

const ProductBacklog = () => {
  const { project } = useOutletContext();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [modalIssue, setModalIssue] = useState(null); // Track the issue for modal
  const [issueComments, setIssueComments] = useState([]); // Store comments for the modal
  const [newComment, setNewComment] = useState(""); // Input for new comment
  const [editIssue, setEditIssue] = useState(null); // Track issue for editing
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "task",
    priority: "",
    story_points: "",
    epic_id: "",
  });
const location = useLocation();
  const [form, setForm] = useState({
    type: "task",
    title: "",
    description: "",
    epicId: "",
    priority: "",
    storyPoints: "",
    sprintId: "",
  });

  /* ================= LOAD ISSUES ================= */
  useEffect(() => {
    if (project?.id) fetchIssues();
  }, [project]);

  const fetchIssues = async () => {
    try {
      const data = await getIssues(project.id);
      setIssues(data || []);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  if (location.state?.refreshBacklog && project?.id) {
    fetchIssues();

    // 🔥 state clear pannum
    window.history.replaceState({}, document.title);
  }
}, [location, project]);

  /* ================= CREATE ISSUE ================= */
  const handleAdd = async () => {
    if (!form.title) return alert("Title required");
    if (form.type === "story" && !form.storyPoints)
      return alert("Story points required");

    setLoading(true);
    try {
      const payload = {
        project_id: project.id,
        name: form.title,
        description: form.description,
        type: form.type.toLowerCase(),
        priority: form.priority.toLowerCase(),
        epic_id: form.epicId || null,
        ...(form.type === "story" && {
          story_points: Number(form.storyPoints),
        }),
      };

      const newTask = await createIssues(payload);
      toast.success("Task Created Successfully");
      setIssues((prev) => [...prev, newTask]);

      setForm({
        type: "task",
        title: "",
        description: "",
        epicId: selectedEpic ? selectedEpic.id : "",
        priority: "",
        storyPoints: "",
        sprintId: "",
        subtask:'',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ASSIGN SPRINT ================= */
  const handleAssignSprint = async () => {
    if (!form.sprintId) return alert("Select sprint");
    if (!selectedIssues.length) return alert("Select tasks");

    try {
      await sprintTaskMove(form.sprintId, {
        issue_ids: selectedIssues,
      });

      await fetchIssues();
      toast.success("Tasks assigned to sprint");

      setSelectedIssues([]);
      setForm({ ...form, sprintId: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign sprint");
    }
  };

  const handleUpdateIssue = async () => {
    if (!editIssue) return;

    const payload = {
      name: editForm.name,
      description: editForm.description,
      type: editForm.type,
      priority: editForm.priority,
      epic_id: editForm.epic_id,
      subtask:editForm.subtask,
    };

    // ✅ Only include story_points if type is story
    if (editForm.type === "story") {
      payload.story_points = parseInt(editForm.story_points) || 0;
    }

    try {
      await updateIssue(editIssue.id, payload);
      toast.success("Issue updated successfully");
      setEditIssue(null);
      // Optional: update local issues array or refetch from parent
    } catch (err) {
      console.error(err);
      toast.error("Failed to update issue");
    }
  };
  const fetchIssueComments = async (issueId) => {
    try {
      const res = await getIssueComments(issueId);
      setIssueComments(res);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await IssueComments(modalIssue.id, newComment);
      toast.success("Comment added");
      setNewComment("");
      fetchIssueComments(modalIssue.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };
  const openIssueModal = async (issue) => {
    setModalIssue(issue);
    await fetchIssueComments(issue.id);
  };
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      await deleteIssues(issueId);
      toast.success("Issue deleted");

      // Update issues list after delete
      setForm((prev) => ({ ...prev })); // Optional: if form depends on issue
      // Or remove from selectedIssues
      setSelectedIssues((prev) => prev.filter((id) => id !== issueId));

      // If you pass `issues` as prop from parent, parent should also refetch issues
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete issue");
    }
  };
  const openEditModal = (issue) => {
    setEditIssue(issue);
    setEditForm({
      name: issue.name || "",
      description: issue.description || "",
      type: issue.type || "task",
      priority: issue.priority || "",
      story_points: issue.story_points || "",
      epic_id: issue.epic_id || "",
    });
  };
  

  return (
    <>
      <Toaster position="top-right" />

      <div className="">

        <Backlog
          issues={issues}
          form={form}
          setForm={setForm}
          handleAdd={handleAdd}
          loading={loading}
          handleAssignSprint={handleAssignSprint}
          setSelectedIssues={setSelectedIssues}
          selectedIssues={selectedIssues}
          handleUpdateIssue={handleUpdateIssue}
          fetchIssueComments={fetchIssueComments}
          handleAddComment={handleAddComment}
          openIssueModal={openIssueModal}
          handleDeleteIssue={handleDeleteIssue}
          openEditModal={openEditModal}
          modalIssue={modalIssue}
          editIssue={editIssue}
          issueComments={issueComments}
          newComment={newComment}
          setNewComment={setNewComment}
          setModalIssue={setModalIssue}
          editForm={editForm}
          setEditIssue={setEditIssue}
          setEditForm={setEditForm}
        />
      </div>
    </>
  );
};

export default ProductBacklog;
