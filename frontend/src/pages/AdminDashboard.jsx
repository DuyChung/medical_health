import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Eye, FilePlus2, FileText, LogOut, Plus, UsersRound } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import { api } from "../lib/api.js";

const initialCase = {
  title: "",
  summary: "",
  content: "",
  location: "",
  occurredAt: new Date().toISOString().slice(0, 16),
  severity: "MEDIUM",
  imageUrl: "",
  urgent: false,
  published: true
};

const initialDoc = {
  title: "",
  description: "",
  category: "Hướng dẫn",
  issuedBy: "Bộ Y tế",
  issuedAt: new Date().toISOString().slice(0, 16)
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [cases, setCases] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [caseForm, setCaseForm] = useState(initialCase);
  const [editingCaseId, setEditingCaseId] = useState("");
  const [caseFiles, setCaseFiles] = useState([]);
  const [docForm, setDocForm] = useState(initialDoc);
  const [docFile, setDocFile] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [summaryRes, casesRes, adminsRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/cases/admin"),
        api.get("/admins")
      ]);
      setSummary(summaryRes.data);
      setCases(casesRes.data.items);
      setAdmins(adminsRes.data.items);
    } catch {
      navigate("/admin");
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("medical_admin_token")) navigate("/admin");
    load();
  }, []);

  async function createCase(event) {
    event.preventDefault();
    setMessage("");
    try {
      const body = new FormData();
      Object.entries(caseForm).forEach(([key, value]) => {
        if (key === "occurredAt") body.append(key, new Date(value).toISOString());
        else body.append(key, String(value));
      });
      [...caseFiles].forEach((file) => body.append("files", file));
      if (editingCaseId) await api.put(`/cases/${editingCaseId}`, body);
      else await api.post("/cases", body);
      setMessage(editingCaseId ? "Đã cập nhật thông báo ca bệnh." : "Đã đăng thông báo ca bệnh mới.");
      setCaseForm(initialCase);
      setCaseFiles([]);
      setEditingCaseId("");
      load();
    } catch (error) {
      const fields = error.response?.data?.errors?.fieldErrors;
      const detail = fields ? Object.entries(fields).map(([key, value]) => `${key}: ${value.join(", ")}`).join("; ") : "";
      setMessage(`Không đăng được bài. ${detail || error.response?.data?.message || "Vui lòng kiểm tra đăng nhập và dữ liệu nhập."}`);
    }
  }

  async function createDocument(event) {
    event.preventDefault();
    setMessage("");
    try {
      const body = new FormData();
      Object.entries(docForm).forEach(([key, value]) => {
        if (key === "issuedAt") body.append(key, new Date(value).toISOString());
        else body.append(key, String(value));
      });
      body.append("file", docFile);
      await api.post("/documents", body);
      setMessage("Đã thêm văn bản y tế.");
      setDocForm(initialDoc);
      setDocFile(null);
      load();
    } catch (error) {
      setMessage(`Không upload được văn bản. ${error.response?.data?.message || "Vui lòng kiểm tra file và dữ liệu nhập."}`);
    }
  }

  async function removeCase(id) {
    await api.delete(`/cases/${id}`);
    setCases((items) => items.filter((item) => item.id !== id));
  }

  function editCase(item) {
    setEditingCaseId(item.id);
    setCaseForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      location: item.location,
      occurredAt: new Date(item.occurredAt).toISOString().slice(0, 16),
      severity: item.severity,
      imageUrl: item.imageUrl || "",
      urgent: item.urgent,
      published: item.published
    });
    window.scrollTo({ top: 760, behavior: "smooth" });
  }

  function logout() {
    localStorage.removeItem("medical_admin_token");
    navigate("/admin");
  }

  const totals = summary?.totals || { cases: 0, documents: 0, visits: 0, postViews: 0 };
  const severityData = useMemo(() => {
    const counts = cases.reduce((acc, item) => ({ ...acc, [item.severity]: (acc[item.severity] || 0) + 1 }), {});
    return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
  }, [cases]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-medical-700 dark:text-cyan-300">Dashboard admin</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">Điều hành cổng thông tin</h1>
        </div>
        <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>

      {message && <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{message}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={AlertTriangle} label="Tổng ca bệnh" value={totals.cases} tone="red" />
        <StatCard icon={FileText} label="Văn bản" value={totals.documents} tone="green" />
        <StatCard icon={UsersRound} label="Lượt truy cập" value={totals.visits} tone="cyan" />
        <StatCard icon={Eye} label="Lượt xem bài" value={totals.postViews} tone="violet" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Lượt truy cập theo ngày</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.visitsByDay || []}>
                <defs>
                  <linearGradient id="visitColor" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area dataKey="visits" stroke="#0891b2" fill="url(#visitColor)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Phân loại mức độ nguy hiểm</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.85fr]">
        <form onSubmit={createCase} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><Plus /> {editingCaseId ? "Chỉnh sửa thông báo ca bệnh" : "Đăng thông báo ca bệnh"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input required placeholder="Tiêu đề" value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
            <input required placeholder="Địa điểm" value={caseForm.location} onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
            <input type="datetime-local" value={caseForm.occurredAt} onChange={(e) => setCaseForm({ ...caseForm, occurredAt: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
            <select value={caseForm.severity} onChange={(e) => setCaseForm({ ...caseForm, severity: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="CRITICAL">Khẩn cấp</option>
            </select>
            <input placeholder="URL hình ảnh" value={caseForm.imageUrl} onChange={(e) => setCaseForm({ ...caseForm, imageUrl: e.target.value })} className="md:col-span-2 rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
            <textarea required placeholder="Mô tả ngắn" value={caseForm.summary} onChange={(e) => setCaseForm({ ...caseForm, summary: e.target.value })} className="md:col-span-2 min-h-24 rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
            <textarea required placeholder="Nội dung chi tiết" value={caseForm.content} onChange={(e) => setCaseForm({ ...caseForm, content: e.target.value })} className="md:col-span-2 min-h-36 rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
            <label className="flex items-center gap-3"><input type="checkbox" checked={caseForm.urgent} onChange={(e) => setCaseForm({ ...caseForm, urgent: e.target.checked })} /> Tin khẩn cấp</label>
            <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={(e) => setCaseFiles(e.target.files)} className="rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-700" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-medical-600 px-5 py-3 font-bold text-white hover:bg-medical-700"><Activity size={18} /> {editingCaseId ? "Cập nhật" : "Đăng bài"}</button>
            {editingCaseId && <button type="button" onClick={() => { setEditingCaseId(""); setCaseForm(initialCase); }} className="rounded-lg border border-slate-200 px-5 py-3 font-bold dark:border-slate-700">Huỷ sửa</button>}
          </div>
        </form>

        <div className="space-y-6">
          <form onSubmit={createDocument} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><FilePlus2 /> Thêm văn bản</h2>
            <div className="grid gap-3">
              <input required placeholder="Tên văn bản" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
              <textarea placeholder="Mô tả" value={docForm.description} onChange={(e) => setDocForm({ ...docForm, description: e.target.value })} className="min-h-20 rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
              <select value={docForm.category} onChange={(e) => setDocForm({ ...docForm, category: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700">
                <option>Hướng dẫn</option>
                <option>Thông tư</option>
                <option>Quy định</option>
              </select>
              <input value={docForm.issuedBy} onChange={(e) => setDocForm({ ...docForm, issuedBy: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
              <input type="datetime-local" value={docForm.issuedAt} onChange={(e) => setDocForm({ ...docForm, issuedAt: e.target.value })} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700" />
              <input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocFile(e.target.files[0])} className="rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-700" />
            </div>
            <button className="mt-5 rounded-lg bg-medical-600 px-5 py-3 font-bold text-white hover:bg-medical-700">Upload văn bản</button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-xl font-bold">Tài khoản admin</h2>
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <span><span className="block font-semibold">{admin.name}</span><span className="text-sm text-slate-500">{admin.email}</span></span>
                  <span className="text-xs font-bold text-medical-700 dark:text-cyan-300">{admin.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-bold">Quản lý bài viết</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr><th className="py-3">Tiêu đề</th><th>Mức độ</th><th>Địa điểm</th><th>Lượt xem</th><th></th></tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-4 font-semibold">{item.title}</td>
                  <td><SeverityBadge severity={item.severity} /></td>
                  <td>{item.location}</td>
                  <td>{item.viewCount}</td>
                  <td className="text-right">
                    <button onClick={() => editCase(item)} className="mr-2 rounded-md bg-cyan-50 px-3 py-2 font-semibold text-medical-700 dark:bg-cyan-500/15 dark:text-cyan-300">Sửa</button>
                    <button onClick={() => removeCase(item.id)} className="rounded-md bg-red-50 px-3 py-2 font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
