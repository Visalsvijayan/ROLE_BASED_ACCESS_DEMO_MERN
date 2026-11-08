export function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? "badge-active" : "badge-inactive"}`}>
      {active ? "active" : "inactive"}
    </span>
  );
}

export function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{role}</span>;
}
