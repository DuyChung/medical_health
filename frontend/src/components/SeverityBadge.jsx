const styles = {
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
};

const labels = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Khẩn cấp"
};

export default function SeverityBadge({ severity }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles[severity] || styles.LOW}`}>
      {labels[severity] || severity}
    </span>
  );
}
