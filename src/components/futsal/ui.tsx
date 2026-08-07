import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const axisStyle = { fontSize: 11, fill: "var(--muted-foreground)" };
const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "warning" | "destructive" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-warning"
        : tone === "destructive"
          ? "text-destructive"
          : tone === "accent"
            ? "text-accent"
            : "text-foreground";
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
      </div>
      <p className={`stat-number mt-3 text-3xl ${toneClass}`}>
        {value}
        {unit ? <span className="ml-1 text-base text-muted-foreground">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

export function ChartPanel({
  title,
  description,
  children,
  right,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <Card className="gap-0 p-4">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold uppercase tracking-wide">
            {title}
          </h3>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}

export function SkillRadar({
  series,
  height = 280,
}: {
  series: { name: string; color: string; data: Record<string, number> }[];
  height?: number;
}) {
  const keys = Object.keys(series[0]?.data ?? {});
  const data = keys.map((k) => {
    const row: Record<string, string | number> = { skill: k };
    series.forEach((s) => (row[s.name] = s.data[k] ?? 0));
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="skill" tick={axisStyle} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        {series.map((s) => (
          <Radar
            key={s.name}
            name={s.name}
            dataKey={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.28}
          />
        ))}
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function SimpleBar({
  data,
  keys,
  height = 260,
}: {
  data: Record<string, string | number>[];
  keys: { key: string; color: string; name: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        {keys.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {keys.map((k) => (
          <Bar key={k.key} dataKey={k.key} name={k.name} fill={k.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLine({
  data,
  keys,
  height = 260,
  domain,
}: {
  data: Record<string, string | number>[];
  keys: { key: string; color: string; name: string }[];
  height?: number;
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} domain={domain} />
        <Tooltip contentStyle={tooltipStyle} />
        {keys.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {keys.map((k) => (
          <Line
            key={k.key}
            type="monotone"
            dataKey={k.key}
            name={k.name}
            stroke={k.color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: k.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimplePie({
  data,
  height = 260,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="75%" paddingAngle={3}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="var(--card)" />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendBadge({ trend }: { trend: "up" | "down" | "flat" }) {
  const map = {
    up: { icon: ArrowUpRight, label: "Evolução", cls: "bg-success/15 text-success" },
    down: { icon: ArrowDownRight, label: "Queda", cls: "bg-destructive/15 text-destructive" },
    flat: { icon: ArrowRight, label: "Estável", cls: "bg-muted text-muted-foreground" },
  }[trend];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${map.cls}`}
    >
      <map.icon className="h-3.5 w-3.5" />
      {map.label}
    </span>
  );
}

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function GradePill({ grade }: { grade: number }) {
  const tone =
    grade >= 7.5 ? "bg-primary/20 text-primary" : grade >= 6 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive";
  return (
    <span className={`stat-number rounded-lg px-2.5 py-1 text-lg ${tone}`}>{grade.toFixed(1)}</span>
  );
}

export function AthleteAvatar({
  name,
  shirt,
  size = "md",
}: {
  name: string;
  shirt: number;
  size?: "sm" | "md" | "lg";
}) {
  const cls = size === "lg" ? "h-16 w-16 text-2xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12 text-lg";
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-xl border border-border bg-secondary font-display font-bold text-primary ${cls}`}
      aria-label={`${name}, camisa ${shirt}`}
    >
      {shirt}
    </div>
  );
}
