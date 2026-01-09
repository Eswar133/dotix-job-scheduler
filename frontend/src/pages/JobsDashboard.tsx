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
  const [taskName, setTaskName] = useState("");
  const [priorityForm, setPriorityForm] = useState<"low" | "medium" | "high">("low");
  const [payloadText, setPayloadText] = useState(`{\n  "example": true\n}`);
  const [creating, setCreating] = useState(false);

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

  async function createJob() {
    setCreating(true);
    try {
      let payloadObj: any;
      try { payloadObj = JSON.parse(payloadText); } catch {
        alert("Payload must be valid JSON");
        return;
      }
      await api.post("/jobs", { taskName, priority: priorityForm, payload: payloadObj });
      setTaskName("");
      setPriorityForm("low");
      setPayloadText(`{\n  "example": true\n}`);
      await fetchJobs();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to create job");
    } finally {
      setCreating(false);
    }
  }

  const emptyText = useMemo(() => loading ? "Syncing with server..." : "No jobs found", [loading]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        
        {/* HEADER */}
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Jobs<span className="text-indigo-600">.</span>
            </h1>
            <p className="mt-1 text-slate-500 font-medium">System background task orchestrator</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Server Status</span>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Operational
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SIDEBAR: CREATE JOB */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">New Task</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Task Name</label>
                    <input
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="e.g. Data Sync"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                    <select
                      value={priorityForm}
                      onChange={(e) => setPriorityForm(e.target.value as any)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payload</label>
                    <textarea
                      value={payloadText}
                      onChange={(e) => setPayloadText(e.target.value)}
                      rows={4}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-[11px] text-indigo-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={createJob}
                    disabled={creating || !taskName.trim()}
                    className="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-[0.98]"
                  >
                    {creating ? "Creating..." : "Create Job"}
                  </button>
                </div>
              </section>
            </div>
          </aside>

          {/* MAIN CONTENT: TABLE */}
          <main className="lg:col-span-2 space-y-6">
            
            {/* FILTERS */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
              <div className="flex gap-4">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer hover:text-indigo-600"
                >
                  {statusOptions.map(s => <option key={s} value={s}>Status: {s.toUpperCase()}</option>)}
                </select>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer hover:text-indigo-600"
                >
                  {priorityOptions.map(p => <option key={p} value={p}>Priority: {p.toUpperCase()}</option>)}
                </select>
              </div>
              
              <button onClick={fetchJobs} className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">
                Refresh Board
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Job Detail</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {jobs.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-20 text-center font-medium text-slate-400 italic">{emptyText}</td></tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="group hover:bg-slate-50/80 transition-all">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-800">{job.taskName}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {job.id} • {new Date(job.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                            job.priority === 'high' ? 'text-orange-600 bg-orange-50' : 
                            job.priority === 'medium' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'
                          }`}>
                            {job.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`flex items-center gap-2 text-xs font-bold ${
                            job.status === 'completed' ? 'text-emerald-600' : 
                            job.status === 'running' ? 'text-indigo-600' : 'text-amber-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              job.status === 'completed' ? 'bg-emerald-500' : 
                              job.status === 'running' ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'
                            }`} />
                            {job.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            disabled={job.status !== "pending" || runningId === job.id}
                            onClick={() => runJob(job.id)}
                            className="text-xs font-black uppercase tracking-tighter px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-600 transition-all"
                          >
                            {runningId === job.id ? "..." : "Execute"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            Latency: 3.5s · Refreshed {new Date().toLocaleTimeString()}
          </p>
        </footer>
      </div>
    </div>
  );
}