import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type JobStatus = "pending" | "running" | "completed";
type JobPriority = "low" | "medium" | "high";

type Job = {
  id: number;
  taskName: string;
  payload: unknown;
  priority: JobPriority;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

const statusOptions = ["all", "pending", "running", "completed"] as const;
const priorityOptions = ["all", "low", "medium", "high"] as const;

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("all");
  const [priority, setPriority] = useState<(typeof priorityOptions)[number]>("all");
  const [loading, setLoading] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      if (priority !== "all") params.priority = priority;

      const res = await api.get<Job[]>("/jobs", { params });
      setJobs(res.data);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority]);

  async function runJob(id: number) {
    setRunningId(id);
    try {
      await api.post(`/jobs/run-job/${id}`);
      setTimeout(() => fetchJobs(), 3500);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to run job");
    } finally {
      setRunningId(null);
    }
  }

  const emptyText = useMemo(() => {
    if (loading) return "Loading jobs...";
    return "No jobs found";
  }, [loading]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Job Scheduler Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Track jobs, filter by status/priority, and run pending jobs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchJobs}
              className="h-10 self-end rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    {emptyText}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t">
                    <td className="px-4 py-3">{job.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {job.taskName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={job.status !== "pending" || runningId === job.id}
                        onClick={() => runJob(job.id)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {runningId === job.id ? "Running..." : "Run Job"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Note: Jobs take ~3 seconds to complete (simulation).
        </p>
      </div>
    </div>
  );
}
