import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  Gauge,
  Heart,
  Radio,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  ChartPanel,
  GradePill,
  SimpleBar,
  SimpleLine,
  StatCard,
  TrendBadge,
  AthleteAvatar,
} from "@/components/futsal/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDB } from "@/lib/futsal/store";
import { athleteSummary, aggregatePhysical, teamMatchStats } from "@/lib/futsal/stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Futsal Scout" },
      {
        name: "description",
        content:
          "Visão geral da equipe de futsal: próxima partida, média de desempenho, alertas de queda e indicadores físicos.",
      },
      { property: "og:title", content: "Dashboard | Futsal Scout" },
      {
        property: "og:description",
        content: "Painel de performance da comissão técnica: dados, diagnóstico e evolução.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const db = useDB();
  const team = db.teams.find((t) => t.id === db.activeTeamId)!;
  const athletes = db.athletes.filter((a) => a.teamId === team.id);
  const matches = db.matches.filter((m) => m.teamId === team.id);
  const finished = matches
    .filter((m) => m.status === "finalizada")
    .sort((a, b) => b.date.localeCompare(a.date));
  const next = matches.find((m) => m.status !== "finalizada");
  const summaries = athletes.map((a) => athleteSummary(db, a.id));
  const teamGrade =
    summaries.reduce((t, s) => t + s.grade, 0) / Math.max(summaries.length, 1);
  const falling = summaries.filter((s) => s.trend === "down");
  const rising = summaries.filter((s) => s.trend === "up");
  const phys = aggregatePhysical(db.physical.filter((p) => athletes.some((a) => a.id === p.athleteId)));
  const games = Math.max(finished.length, 1);

  const evolution = [...finished]
    .reverse()
    .map((m) => {
      const st = teamMatchStats(db, m.id);
      return {
        label: m.opponent.split(" ")[0] ?? m.opponent,
        tecnico: st.passAccuracy,
        ofensiva: st.shots === 0 ? 0 : Math.round((st.goals / st.shots) * 100),
        defensiva: Math.min(100, st.tackles * 2 + st.interceptions),
      };
    });

  const intensity = [...finished].reverse().map((m) => {
    const rows = db.physical.filter((p) => p.matchId === m.id);
    const agg = aggregatePhysical(rows);
    return {
      name: m.opponent.split(" ")[0] ?? m.opponent,
      sprints: Math.round(agg.sprints / Math.max(rows.length, 1)),
      distancia: Math.round(agg.distance / Math.max(rows.length, 1) / 100) / 10,
    };
  });

  return (
    <AppShell
      title="Dashboard"
      actions={
        next ? (
          <Button asChild variant="default" className="font-semibold">
            <Link to="/scout/$matchId" params={{ matchId: next.id }}>
              <Radio className="mr-1 h-4 w-4" /> Scout ao vivo
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-5">
        <Card className="hero-pitch gap-0 overflow-hidden border-primary/25 p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Dados → Diagnóstico → Treinamento → Evolução
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
                {team.name}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Registre a partida em tempo real no tablet e transforme cada toque em diagnóstico,
                recomendação de treino e acompanhamento de evolução individual.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">Treinador: {team.coach}</Badge>
                <Badge variant="secondary">Aux.: {team.assistant}</Badge>
                <Badge variant="secondary">Físico: {team.fitnessCoach}</Badge>
              </div>
            </div>
            {next ? (
              <div className="surface-panel min-w-0 p-4">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <CalendarClock className="h-4 w-4" /> Próxima partida
                </p>
                <p className="mt-2 truncate font-display text-2xl font-bold uppercase">
                  {team.category} <span className="text-primary">x</span> {next.opponent}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(next.date + "T12:00:00").toLocaleDateString("pt-BR")} • {next.time} •{" "}
                  {next.competition}
                </p>
                <p className="text-sm text-muted-foreground">
                  {next.venue} • {next.homeAway}
                </p>
                <Button asChild className="mt-4 w-full font-semibold">
                  <Link to="/scout/$matchId" params={{ matchId: next.id }}>
                    Iniciar partida
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Atletas cadastrados"
            value={athletes.length}
            hint={`${db.teams.length} equipes na conta`}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Média de desempenho"
            value={teamGrade.toFixed(1)}
            unit="/10"
            tone="primary"
            hint={`${finished.length} partidas analisadas`}
            icon={<Gauge className="h-4 w-4" />}
          />
          <StatCard
            label="Distância média / atleta"
            value={(phys.distance / Math.max(athletes.length, 1) / games / 1000).toFixed(1)}
            unit="km"
            tone="accent"
            hint={`FC média ${phys.avgHr} bpm • ${phys.maxHr} bpm máx`}
            icon={<Heart className="h-4 w-4" />}
          />
          <StatCard
            label="Alertas de queda"
            value={falling.length}
            tone={falling.length ? "destructive" : "default"}
            hint={`${rising.length} atletas em evolução`}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartPanel
            title="Evolução da equipe"
            description="Desempenho técnico, eficiência ofensiva e defensiva por partida"
          >
            <SimpleLine
              data={evolution}
              domain={[0, 100]}
              keys={[
                { key: "tecnico", name: "Técnico (passe %)", color: "var(--chart-1)" },
                { key: "ofensiva", name: "Ofensiva %", color: "var(--chart-2)" },
                { key: "defensiva", name: "Defensiva", color: "var(--chart-3)" },
              ]}
            />
          </ChartPanel>
          <ChartPanel title="Intensidade física" description="Sprints e distância média por atleta">
            <SimpleBar
              data={intensity}
              keys={[
                { key: "sprints", name: "Sprints", color: "var(--chart-2)" },
                { key: "distancia", name: "Distância (x100m)", color: "var(--chart-1)" },
              ]}
            />
          </ChartPanel>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="gap-0 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wide">
              <TrendingUp className="h-4 w-4 text-primary" /> Atletas em evolução
            </h3>
            <div className="flex flex-col gap-2">
              {(rising.length ? rising : summaries.slice(0, 3)).slice(0, 4).map((s) => (
                <Link
                  key={s.athlete.id}
                  to="/atletas/$athleteId"
                  params={{ athleteId: s.athlete.id }}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-secondary/40 p-2.5 transition-colors hover:bg-secondary"
                >
                  <AthleteAvatar name={s.athlete.name} shirt={s.athlete.shirt} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.athlete.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Passes {s.passAccuracy}% • {s.athlete.position}
                    </p>
                  </div>
                  <TrendBadge trend={s.trend} />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wide">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Alertas de desempenho
            </h3>
            <div className="flex flex-col gap-2">
              {(falling.length
                ? falling
                : summaries.sort((a, b) => a.grade - b.grade).slice(0, 3)
              )
                .slice(0, 4)
                .map((s) => (
                  <Link
                    key={s.athlete.id}
                    to="/atletas/$athleteId"
                    params={{ athleteId: s.athlete.id }}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-secondary/40 p-2.5 transition-colors hover:bg-secondary"
                  >
                    <AthleteAvatar name={s.athlete.name} shirt={s.athlete.shirt} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.athlete.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Nota média {s.grade.toFixed(1)} • perdas {s.counts["Perda de bola"] ?? 0}
                      </p>
                    </div>
                    <GradePill grade={s.grade} />
                  </Link>
                ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wide">
              <FileText className="h-4 w-4 text-accent" /> Últimos relatórios
            </h3>
            <div className="flex flex-col gap-2">
              {finished.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  to="/partidas/$matchId"
                  params={{ matchId: m.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-secondary/40 p-2.5 transition-colors hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">vs {m.opponent}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR")} • {m.competition}
                    </p>
                  </div>
                  <span className="stat-number text-lg text-primary">
                    {m.scoreUs}-{m.scoreThem}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <Card className="gap-0 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wide">
            <Shield className="h-4 w-4 text-primary" /> Indicadores físicos gerais
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { l: "Distância total", v: `${(phys.distance / 1000).toFixed(1)} km` },
              { l: "Vel. máxima", v: `${phys.maxSpeed} km/h` },
              { l: "Vel. média", v: `${phys.avgSpeed} km/h` },
              { l: "FC média", v: `${phys.avgHr} bpm` },
              { l: "Sprints", v: phys.sprints },
              { l: "Calorias", v: phys.calories },
            ].map((i) => (
              <div key={i.l} className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{i.l}</p>
                <p className="stat-number mt-1 text-xl">{i.v}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
