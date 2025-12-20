import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getProjectReport } from "../API/ProjectAPI";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ===== UNIQUE PREMIUM COLORS ===== */
const COLORS = [
  "#EF4444", // Highest - Red
  "#F97316", // High - Orange
  "#FACC15", // Medium - Yellow
  "#22C55E", // Low - Green
  "#38BDF8", // Lowest - Blue
];

const ProjectReportSummary = () => {
  const { project } = useOutletContext();
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (project?.id) fetchReport();
  }, [project?.id]);

  const fetchReport = async () => {
    try {
      const res = await getProjectReport(project.id);
      setReport(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!report) return <p className="text-sm animate-pulse">Loading Summary....</p>;

  /* ================= WORK ITEM STATUS ================= */
  const workStatusData = report.work_items_status.breakdown
    .filter((b) => b.status.toLowerCase() !== "backlog")
    .map((b) => ({
      name: b.status.replace("_", " "),
      value: b.count,
    }));

const typeOfWorkData = report.types_of_work
  .filter(
    (t) => {
      const type = t.type.toLowerCase().replace("-", "").replace("_", "");
      return !["subtask", "feature"].includes(type);
    }
  )
  .map((t) => ({
    name: t.type,
    value: t.count,
  }));


  /* ================= 🔥 PRIORITY DATA ================= */
  const priorityData = Object.entries(
    report.issues_breakdown_by_priority
  ).map(([key, value]) => ({
    name: key.toLowerCase(),
    value,
  }));

  return (
    <section className="space-y-5">
      {/* ================= PROJECT INFO ================= */}
      <div className="bg-gray-100 rounded-xl p-4 shadow-sm">
        <p className="text-[10px] uppercase text-gray-500 mb-1">
          Project Name
        </p>
        <p className="text-lg font-semibold mb-3">
          {report.project_summary.name}
        </p>

        <p className="text-[10px] uppercase text-gray-500 mb-1">
          Description
        </p>
        <p className="capitalize text-sm">
          {project.description}
        </p>
      </div>

      {/* ================= TOP SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Completion">
          {report.project_summary.completion_percentage}%
        </Card>
        <Card title="Total Task">
          {report.work_items_status.total}
        </Card>
        <Card title="Project Lead">
          {report.project_summary.lead}
        </Card>
      </div>

      {/* ================= PIE CHART SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ChartCard title="Work Items Status">
          <PieChartBlock data={workStatusData} />
        </ChartCard>

        <ChartCard title="Types of Work">
          <PieChartBlock data={typeOfWorkData} />
        </ChartCard>

        <ChartCard title="Priority Breakdown">
          <PieChartBlock data={priorityData} />
        </ChartCard>
      </div>

      {/* ================= EPICS PROGRESS ================= */}
      <div className="bg-gray-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">
          Epics Progress
        </h3>

        <div className="space-y-2 overflow-y-auto h-30">
          {report.epics_progress.map((epic) => (
            <div key={epic.id}>
              <div className="flex justify-between text-xs mb-1">
                <span>{epic.name}</span>
                <span>{epic.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                  className="h-1.5 bg-blue-600 rounded-full"
                  style={{ width: `${epic.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectReportSummary;

/* ================= SMALL UI COMPONENTS ================= */

const Card = ({ title, children }) => (
  <div className="bg-gray-100 rounded-xl shadow-sm p-4">
    <p className="text-[10px] capitalize text-gray-500 mb-1">
      {title}
    </p>
    <p className="text-lg font-semibold">{children}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-gray-100 rounded-xl shadow-sm p-4">
    <h3 className="text-sm font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

/* ================= DONUT CHART ================= */

const PieChartBlock = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[160px] h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={60}
              innerRadius={38}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const value = payload[0].value;
                  const percent = (
                    (value / total) *
                    100
                  ).toFixed(1);

                  return (
                    <div className="bg-white px-3 py-2 rounded shadow text-xs">
                      <p className="font-semibold">
                        {payload[0].name}
                      </p>
                      <p>{value} issues</p>
                      <p className="text-gray-500">
                        {percent}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-gray-800"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 text-xs">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  COLORS[i % COLORS.length],
              }}
            />
            <span>
              {d.name} : {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
