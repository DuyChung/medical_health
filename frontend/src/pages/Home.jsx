import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { AlertTriangle, BellRing, FileText, MapPin, Search, ShieldAlert, UsersRound } from "lucide-react";
import Loading from "../components/Loading.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import StatCard from "../components/StatCard.jsx";
import { API_URL, api } from "../lib/api.js";

export default function Home() {
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [caseRes, docRes] = await Promise.all([
        api.get("/cases", { params: { q: query, take: 12 }, timeout: 8000 }),
        api.get("/documents", { timeout: 8000 })
      ]);
      setCases(caseRes.data.items);
      setDocuments(docRes.data.items.slice(0, 4));
    } catch {
      setError("Chưa kết nối được dữ liệu ca bệnh. Vui lòng kiểm tra backend, PostgreSQL và migrate/seed database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api.post("/analytics/visit", { path: "/" }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("case:new", (item) => {
      setToast(item);
      setCases((items) => [item, ...items]);
    });
    return () => socket.disconnect();
  }, []);

  const urgent = cases.find((item) => item.urgent);
  const stats = useMemo(() => ({
    total: cases.length,
    critical: cases.filter((item) => item.severity === "CRITICAL" || item.severity === "HIGH").length,
    documents: documents.length
  }), [cases, documents]);

  return (
    <div>
      {toast && (
        <div className="fixed right-4 top-24 z-50 max-w-sm rounded-lg border border-red-200 bg-white p-4 shadow-soft dark:border-red-900 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-sm font-bold text-red-600"><BellRing size={18} /> Ca bệnh mới</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{toast.title}</p>
        </div>
      )}

      <section className="bg-gradient-to-br from-cyan-950 via-medical-800 to-emerald-800 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.15fr_.85fr] md:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">
              <ShieldAlert size={18} /> Cảnh báo y tế quốc gia
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal md:text-6xl">Cổng thông tin ca bệnh y tế</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-cyan-50 md:text-lg">
              Theo dõi ca bệnh mới, văn bản điều hành, cảnh báo khẩn cấp và dữ liệu truy cập theo thời gian thực.
            </p>
            <div className="mt-7 flex max-w-2xl items-center gap-3 rounded-lg bg-white p-2 text-slate-900 shadow-soft">
              <Search className="ml-2 shrink-0 text-medical-700" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none" placeholder="Tìm kiếm theo tiêu đề, địa điểm, mô tả..." />
            </div>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/12 p-5 backdrop-blur">
            <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-100"><AlertTriangle size={18} /> Tin khẩn cấp nổi bật</p>
            {urgent ? (
              <Link to={`/cases/${urgent.id}`} className="block">
                <img className="h-44 w-full rounded-lg object-cover" src={urgent.imageUrl} alt={urgent.title} />
                <div className="mt-4 flex items-center gap-2"><SeverityBadge severity={urgent.severity} /><span className="text-sm text-cyan-100">{new Date(urgent.occurredAt).toLocaleDateString("vi-VN")}</span></div>
                <h2 className="mt-3 text-2xl font-bold">{urgent.title}</h2>
                <p className="mt-2 text-cyan-50">{urgent.summary}</p>
              </Link>
            ) : <p>Chưa có cảnh báo khẩn cấp.</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
            {error}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={UsersRound} label="Tổng số ca hiển thị" value={stats.total} tone="cyan" />
          <StatCard icon={AlertTriangle} label="Ca mức cao/khẩn cấp" value={stats.critical} tone="red" />
          <StatCard icon={FileText} label="Văn bản mới" value={stats.documents} tone="green" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Danh sách ca bệnh mới</h2>
          </div>
          {loading ? <Loading /> : (
            <div className="grid gap-5 md:grid-cols-2">
              {cases.map((item) => (
                <Link key={item.id} to={`/cases/${item.id}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <img className="h-48 w-full object-cover" src={item.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"} alt={item.title} />
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2"><SeverityBadge severity={item.severity} />{item.urgent && <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">Khẩn</span>}</div>
                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-medical-700 dark:text-white">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
                    <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><MapPin size={16} /> {item.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Văn bản mới cập nhật</h2>
          {documents.map((doc) => (
            <a key={doc.id} href={`${API_URL}/api/documents/${doc.id}/download`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-medical-500 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase text-medical-700 dark:text-cyan-300">{doc.category}</p>
              <h3 className="mt-2 font-bold text-slate-950 dark:text-white">{doc.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{doc.issuedBy}</p>
            </a>
          ))}
        </aside>
      </section>
    </div>
  );
}
