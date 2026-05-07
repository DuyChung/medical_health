import { Activity, FileText, LayoutDashboard, Moon, Search, ShieldPlus, Sun } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Layout({ children }) {
  const { dark, toggleDark } = useTheme();
  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-medical-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-medical-600 text-white">
              <ShieldPlus size={24} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-slate-950 dark:text-white">Cổng Y tế Ca bệnh</span>
              <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Giám sát, cảnh báo và văn bản y tế</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink className={navClass} to="/">Trang chủ</NavLink>
            <NavLink className={navClass} to="/documents">Văn bản</NavLink>
            <NavLink className={navClass} to="/admin">Admin</NavLink>
          </nav>
          <button onClick={toggleDark} className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-200" aria-label="Đổi giao diện">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="grid grid-cols-3 border-t border-slate-200 md:hidden dark:border-slate-800">
          <NavLink className={navClass} to="/"><Activity className="mx-auto" size={18} />Trang chủ</NavLink>
          <NavLink className={navClass} to="/documents"><FileText className="mx-auto" size={18} />Văn bản</NavLink>
          <NavLink className={navClass} to="/admin"><LayoutDashboard className="mx-auto" size={18} />Admin</NavLink>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between dark:text-slate-400">
          <p>© 2026 Cổng thông tin y tế. Dữ liệu hiển thị phục vụ giám sát và truyền thông rủi ro.</p>
          <p className="flex items-center gap-2"><Search size={16} /> Tối ưu tìm kiếm nhanh và SEO.</p>
        </div>
      </footer>
    </div>
  );
}
