const PIP_COLORS = ["bg-danger", "bg-accent", "bg-success", "bg-warning"] as const;

function colorForName(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PIP_COLORS[hash % PIP_COLORS.length];
}

function initialsForName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PlayerPip({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${colorForName(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsForName(name)}
    </span>
  );
}
