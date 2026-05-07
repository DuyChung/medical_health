import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Download, Eye, MapPin } from "lucide-react";
import Loading from "../components/Loading.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import { api, fileUrl } from "../lib/api.js";

export default function CaseDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cases/${id}`).then((res) => setItem(res.data.item)).finally(() => setLoading(false));
    api.post("/analytics/visit", { path: `/cases/${id}` }).catch(() => {});
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><Loading /></div>;
  if (!item) return <div className="mx-auto max-w-5xl px-4 py-10">Không tìm thấy bài viết.</div>;

  return (
    <article className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/" className="text-sm font-semibold text-medical-700 dark:text-cyan-300">← Quay lại trang chủ</Link>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <img className="h-72 w-full object-cover md:h-96" src={item.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"} alt={item.title} />
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={item.severity} />
            {item.urgent && <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">Thông báo khẩn</span>}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl dark:text-white">{item.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><MapPin size={17} /> {item.location}</span>
            <span className="flex items-center gap-2"><CalendarDays size={17} /> {new Date(item.occurredAt).toLocaleString("vi-VN")}</span>
            <span className="flex items-center gap-2"><Eye size={17} /> {item.viewCount} lượt xem</span>
          </div>
          <p className="mt-6 text-lg font-semibold leading-8 text-slate-700 dark:text-slate-200">{item.summary}</p>
          <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700 dark:text-slate-300">{item.content}</div>
          {item.attachments?.length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <h2 className="text-xl font-bold">File đính kèm</h2>
              <div className="mt-4 grid gap-3">
                {item.attachments.map((file) => (
                  <a key={file.id} href={fileUrl(file.url)} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-medical-500 dark:border-slate-800">
                    <span>{file.originalName}</span>
                    <Download size={18} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
