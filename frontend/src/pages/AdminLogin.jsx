import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { api } from "../lib/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@yte.gov.vn", password: "Admin@123456" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("medical_admin_token", res.data.token);
      navigate("/admin/dashboard");
    } catch {
      setError("Đăng nhập không thành công. Vui lòng kiểm tra tài khoản.");
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
      <div>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-medical-600 text-white"><ShieldCheck /></div>
        <h1 className="text-4xl font-bold text-slate-950 dark:text-white">Đăng nhập quản trị</h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Khu vực dành cho cán bộ được phân quyền đăng thông báo, quản lý văn bản và theo dõi analytics.</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-2 text-lg font-bold"><LockKeyhole /> Tài khoản admin</div>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">{error}</div>}
        <label className="mb-4 block">
          <span className="text-sm font-semibold">Email</span>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-3 outline-none focus:border-medical-500 dark:border-slate-700" />
        </label>
        <label className="mb-6 block">
          <span className="text-sm font-semibold">Mật khẩu</span>
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-3 outline-none focus:border-medical-500 dark:border-slate-700" />
        </label>
        <button className="focus-ring w-full rounded-lg bg-medical-600 px-4 py-3 font-bold text-white hover:bg-medical-700">Đăng nhập</button>
      </form>
    </div>
  );
}
