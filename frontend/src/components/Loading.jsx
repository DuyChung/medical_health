export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="skeleton h-44 rounded-lg" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="skeleton h-28 rounded-lg" />
        <div className="skeleton h-28 rounded-lg" />
        <div className="skeleton h-28 rounded-lg" />
      </div>
    </div>
  );
}
