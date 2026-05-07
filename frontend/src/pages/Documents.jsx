import { useEffect, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { API_URL, api } from "../lib/api.js";

export default function Documents() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      api.get("/documents", { params: { q, category }, timeout: 8000 })
        .then((res) => setItems(res.data.items))
        .catch(() => setError("Chưa tải được kho văn bản. Vui lòng kiểm tra kết nối backend và PostgreSQL."));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-medical-700 dark:text-cyan-300">Kho văn bản</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">Văn bản, thông tư, quy định y tế</h1>
      </div>
      <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px] dark:border-slate-800 dark:bg-slate-900">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
          <Search size={18} className="text-slate-500" />
          <input value={q} onChange={(event) => setQ(event.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Tìm kiếm văn bản..." />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-3 py-3 dark:border-slate-700">
          <option value="">Tất cả phân loại</option>
          <option value="Hướng dẫn">Hướng dẫn</option>
          <option value="Thông tư">Thông tư</option>
          <option value="Quy định">Quy định</option>
        </select>
      </div>
      {error && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-500/15 dark:text-amber-200">{error}</div>}
      <div className="grid gap-4">
        {items.map((item) => (
          <a key={item.id} href={`${API_URL}/api/documents/${item.id}/download`} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-medical-500 md:grid-cols-[48px_1fr_auto] md:items-center dark:border-slate-800 dark:bg-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-medical-700 dark:bg-cyan-500/15 dark:text-cyan-300"><FileText /></span>
            <span>
              <span className="text-xs font-bold uppercase text-medical-700 dark:text-cyan-300">{item.category}</span>
              <span className="mt-1 block text-lg font-bold text-slate-950 dark:text-white">{item.title}</span>
              <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{item.description}</span>
            </span>
            <span className="inline-flex items-center gap-2 font-semibold text-medical-700 dark:text-cyan-300"><Download size={18} /> Tải về</span>
          </a>
        ))}
      </div>
    </div>
  );
}
