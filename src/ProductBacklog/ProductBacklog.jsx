import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Epic from "./Epic";
import { createEpic, getEpic, getIssues, createIssues, sprintTaskMove } from "../API/projectAPI";
import toast, { Toaster } from "react-hot-toast";
import Backlog from "./Backlog";

const ProductBacklog = () => {
  const { project } = useOutletContext();

  const [epics, setEpics] = useState([]);
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);


  const [form, setForm] = useState({
    type: "task",
    title: "",
    description: "",
    epicId: "",
    priority: "",
    storyPoints: "",
    sprintId: "",
  });

  /* ================= LOAD EPICS ================= */
  useEffect(() => {
    if (project?.id) loadEpics();
  }, [project]);

  const loadEpics = async () => {
    try {
      const data = await getEpic(project.id);
      setEpics(data);
    } catch (err) {
      console.error(err);
    }
  };

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

  /* ================= CREATE EPIC ================= */
  const handleEpicCreate = async (epicData) => {
    try {
      const payload = {
        ...epicData,
        project_id: project.id,
      };
      const newEpic = await createEpic(payload);
      toast.success("Epic Created Successfully");
      setEpics((prev) => [...prev, newEpic]);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CREATE ISSUE ================= */
const handleAdd = async () => {
  if (!form.title) return alert("Title required");
  if (form.type === "story" && !form.storyPoints)
    return alert("Story points required for story");

  setLoading(true);
  try {
    const payload = {
      project_id: project.id,
      name: form.title,
      description: form.description,
      type: form.type.toLowerCase(),
      priority: form.priority.toLowerCase(),
      epic_id: form.epicId || null,
      ...(form.type === "story" && { story_points: Number(form.storyPoints) }),
    };
    const newTask = await createIssues(payload); // ✅ capture response

    toast.success("Task Created Successfully");

    // 1️⃣ Append new task to state
    setIssues((prev) => [...prev, newTask]);

    // 2️⃣ Reset form
    setForm({
      type: "task",
      title: "",
      description: "",
      epicId: selectedEpic ? selectedEpic.id : "",
      priority: "",
      storyPoints: "",
      sprintId: "",
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


 const handleAssignSprint = async () => {
  if (!form.sprintId) {
    return alert("Please select a sprint");
  }

  if (!selectedIssues || selectedIssues.length === 0) {
    return alert("Please select at least one task");
  }

  try {
    await sprintTaskMove(
      form.sprintId,                 // ✅ sprintId ONLY
      { issue_ids: selectedIssues }  // ✅ payload ONLY
    );
    await fetchIssues();

    toast.success("Tasks assigned to sprint successfully");

    setSelectedIssues([]);
    setForm({ ...form, sprintId: "" });
    fetchSprints();
  } catch (err) {
    console.error(err);
    toast.error("Failed to assign sprint");
  }
};

  return (
    <>
      <Toaster position="top-right" />

      <div className="flex gap-6">
        <Epic
          epics={epics}
          selectedEpic={selectedEpic}
          onCreate={handleEpicCreate}
      onSelectEpic={(epic) => {
  setSelectedEpic((prev) => {
    // 🔁 same epic click panna → All Tasks
    const isSameEpic = prev?.id === epic?.id;
    const nextEpic = isSameEpic ? null : epic;

    setForm((prevForm) => ({
      ...prevForm,
      epicId: nextEpic ? nextEpic.id : "",
    }));

    return nextEpic;
  });
}}

        />

        <Backlog
          epics={epics}
          selectedEpic={selectedEpic}
          issues={issues}
          form={form}
          setForm={setForm}
          handleAdd={handleAdd}
          loading={loading}
          handleAssignSprint={handleAssignSprint}
          setSelectedIssues={setSelectedIssues}
          selectedIssues={selectedIssues}
        />
      </div>
      
    </>
  );
};

export default ProductBacklog;
