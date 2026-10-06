export default function PlaceholderPage({ title }) {
  return (
    <div className="p-8">
      <div className="text-2xl font-extrabold mb-2">{title}</div>
      <div className="text-sm text-muted">This screen is coming up next.</div>
    </div>
  );
}
