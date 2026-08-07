import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Flame, HeartPulse, Timer, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  AthleteAvatar,
  ChartPanel,
  GradePill,
  SimpleLine,
  SkillRadar,
  StatCard,
  TrendBadge,
} from "@/components/futsal/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDB } from "@/lib/futsal/store";
import {
  age,
  athleteSummary,
  developmentPlan,
  diagnose,
  recommendations,
} from "@/lib/futsal/stats";

export const Route = createFileRoute("/atletas/$athleteId")({
  head: () => ({
    meta: [
      { title: "Perfil do atleta | Futsal Scout" },
      {
        name: "description",
        content:
          "Perfil individual com nota da partida, radar de competências, histórico, diagnóstico e plano de desenvolvimento.",
      },
      { property: "og:title", content: "Perfil do atleta | Futsal Scout" },
      { property: "og:description", content: "Diagnóstico automático e PDI esportivo por atleta." },
    ],
  }),
  component: AthleteProfile,
  notFoundComponent: () => <p className="p-8 text-center">Atleta não encontrado.</p>,
});

function AthleteProfile() {
  const { athleteId } = Route.useParams();
  const db = useDB();
  const athlete = db.athletes.find((a) => a.id === athleteId);
  if (!athlete)
    return (
      <AppShell title="Atleta">
        <p className="text-muted-foreground">Atleta não encontrado.</p>
      </AppShell>
    );

  const s = athleteSummary(db, athleteId);
  const { strengths, improvements } = diagnose(s);
  const recs = recommendations(s);
  const plans = developmentPlan(s);
  const games = Math.max(s.matches, 1);

  return (
    <AppShell
      title={athlete.name}
      subtitle={`Camisa ${athlete.shirt} • ${athlete.position}`}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/atletas">
            <ArrowLeft className="mr-1 h-4 w-4" /> Plantel
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Card className="hero-pitch gap-0 p-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <AthleteAvatar name={athlete.name} shirt={athlete.shirt} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-bold uppercase sm:text-3xl">
                  {athlete.name}
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  {athlete.position} • {age(athlete.birthDate)} anos • {athlete.height} cm •{" "}
                  {athlete.weight} kg • pé {athlete.foot.toLowerCase()}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <TrendBadge trend={s.trend} />
                  <Badge variant="secondary">{s.matches} partidas</Badge>
                  <Badge variant="secondary">{s.minutes} min jogados</Badge>
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3 sm:col-auto">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Nota média
                </p>
                <p className="stat-number text-4xl text-primary">{s.grade.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="tecnico">
          <TabsList className="flex-wrap">
            <TabsTrigger value="tecnico">Técnico</TabsTrigger>
            <TabsTrigger value="fisico">Físico</TabsTrigger>
            <TabsTrigger value="radar">Radar</TabsTrigger>
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
            <TabsTrigger value="inteligencia">Inteligência</TabsTrigger>
            <TabsTrigger value="pdi">PDI</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="tecnico" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { l: "Minutos jogados", v: s.minutes },
              { l: "Gols", v: s.counts["Gol"] ?? 0, tone: "primary" as const },
              { l: "Assistências", v: s.counts["Assistência"] ?? 0, tone: "accent" as const },
              { l: "Precisão de passes", v: `${s.passAccuracy}%` },
              { l: "Passes certos", v: s.counts["Passe certo"] ?? 0 },
              { l: "Passes errados", v: s.counts["Passe errado"] ?? 0 },
              { l: "Finalizações", v: (s.counts["Chute a gol"] ?? 0) + (s.counts["Chute para fora"] ?? 0) },
              { l: "Desarmes", v: s.counts["Desarme"] ?? 0 },
              { l: "Interceptações", v: s.counts["Interceptação"] ?? 0 },
              { l: "Perdas de bola", v: s.counts["Perda de bola"] ?? 0, tone: "warning" as const },
              { l: "Faltas cometidas", v: s.counts["Falta cometida"] ?? 0 },
              {
                l: "Cartões",
                v: `${s.counts["Cartão amarelo"] ?? 0}A / ${s.counts["Cartão vermelho"] ?? 0}V`,
                tone: "destructive" as const,
              },
            ].map((i) => (
              <StatCard key={i.l} label={i.l} value={i.v} tone={i.tone ?? "default"} />
            ))}
          </TabsContent>

          <TabsContent value="fisico" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Distância total"
              value={(s.physical.distance / 1000).toFixed(1)}
              unit="km"
              hint={`${Math.round(s.physical.distance / games)} m por partida`}
              icon={<Timer className="h-4 w-4" />}
            />
            <StatCard
              label="Velocidade máxima"
              value={s.physical.maxSpeed || athlete.maxSpeed}
              unit="km/h"
              tone="primary"
              icon={<Zap className="h-4 w-4" />}
            />
            <StatCard label="Velocidade média" value={s.physical.avgSpeed} unit="km/h" />
            <StatCard
              label="FC média"
              value={s.physical.avgHr || athlete.avgHr}
              unit="bpm"
              hint={`FC máxima ${s.physical.maxHr || athlete.maxHr} bpm`}
              icon={<HeartPulse className="h-4 w-4" />}
            />
            <StatCard label="Sprints" value={s.physical.sprints} hint={`${Math.round(s.physical.sprints / games)} por jogo`} />
            <StatCard label="Alta intensidade" value={s.physical.highIntensityMin} unit="min" tone="warning" />
            <StatCard label="Intensidade moderada" value={s.physical.moderateIntensityMin} unit="min" />
            <StatCard
              label="Calorias estimadas"
              value={s.physical.calories}
              icon={<Flame className="h-4 w-4" />}
            />
          </TabsContent>

          <TabsContent value="radar" className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <ChartPanel title="Radar de competências" description="Construído com os dados acumulados das partidas">
              <SkillRadar
                height={340}
                series={[{ name: athlete.name, color: "var(--chart-1)", data: s.radar }]}
              />
            </ChartPanel>
            <Card className="gap-0 p-4">
              <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
                Índices
              </h3>
              <div className="flex flex-col gap-3">
                {Object.entries(s.radar).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                    <Progress value={v} className="mt-1 h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="evolucao" className="mt-4 grid gap-4">
            <ChartPanel
              title="Evolução histórica"
              description="Nota da partida e precisão de passes nas últimas partidas"
              right={<TrendBadge trend={s.trend} />}
            >
              <SimpleLine
                data={s.gradeHistory}
                keys={[
                  { key: "passes", name: "Passes %", color: "var(--chart-1)" },
                  { key: "nota", name: "Nota", color: "var(--chart-2)" },
                  { key: "intensidade", name: "Sprints", color: "var(--chart-3)" },
                ]}
                height={300}
              />
            </ChartPanel>
            <Card className="gap-0 p-4">
              <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
                Partida a partida
              </h3>
              <div className="flex flex-wrap gap-2">
                {s.gradeHistory.map((g, i) => (
                  <div
                    key={i}
                    className="min-w-24 rounded-lg border border-border bg-secondary/40 p-3 text-center"
                  >
                    <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                      {g.label}
                    </p>
                    <p className="stat-number mt-1 text-xl text-primary">{g.passes}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">nota {g.nota}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inteligencia" className="mt-4 grid gap-4 xl:grid-cols-2">
            <Card className="gap-0 p-4">
              <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide text-primary">
                Pontos fortes
              </h3>
              <ul className="flex flex-col gap-2">
                {strengths.map((t) => (
                  <li
                    key={t}
                    className="rounded-lg border border-primary/25 bg-primary/10 p-3 text-sm"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="gap-0 p-4">
              <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide text-warning">
                Pontos de melhoria
              </h3>
              <ul className="flex flex-col gap-2">
                {improvements.map((t) => (
                  <li
                    key={t}
                    className="rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="gap-0 p-4 xl:col-span-2">
              <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
                Recomendação automática de treinamento
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {recs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma fragilidade crítica identificada. Manter carga atual.
                  </p>
                ) : null}
                {recs.map((r) => (
                  <div key={r.problem} className="rounded-xl border border-border bg-secondary/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-destructive">
                      Problema identificado
                    </p>
                    <p className="mt-1 text-sm font-semibold">{r.problem}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-primary">
                      Recomendação
                    </p>
                    <p className="text-sm font-semibold">{r.recommendation}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {r.exercises.map((e) => (
                        <li key={e} className="rounded-full bg-secondary px-3 py-1 text-xs">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pdi" className="mt-4 grid gap-4 md:grid-cols-2">
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Atleta acima das metas atuais — novo ciclo de metas será gerado após a próxima partida.
              </p>
            ) : null}
            {plans.map((p) => (
              <Card key={p.objective} className="gap-0 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Plano de desenvolvimento
                </p>
                <h3 className="mt-1 font-display text-lg font-bold uppercase">{p.objective}</h3>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <p className="stat-number text-xl">
                      {p.current}
                      {p.unit}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground">Atual</p>
                  </div>
                  <div className="rounded-lg bg-primary/15 p-2">
                    <p className="stat-number text-xl text-primary">
                      {p.target}
                      {p.unit}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground">Meta</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <p className="stat-number text-xl">{p.deadlineDays}d</p>
                    <p className="text-[10px] uppercase text-muted-foreground">Prazo</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.sessions}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progresso da meta</span>
                    <span className="font-semibold">{Math.min(100, p.progress)}%</span>
                  </div>
                  <Progress value={Math.min(100, p.progress)} className="mt-1 h-2" />
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <Card className="gap-0 p-4">
              <h3 className="mb-4 font-display text-base font-semibold uppercase tracking-wide">
                Banco histórico do jogador
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { l: "Partidas", v: s.matches },
                  { l: "Minutos", v: s.minutes },
                  { l: "Gols", v: s.counts["Gol"] ?? 0 },
                  { l: "Assistências", v: s.counts["Assistência"] ?? 0 },
                  { l: "Passes certos", v: s.counts["Passe certo"] ?? 0 },
                  {
                    l: "Finalizações",
                    v: (s.counts["Chute a gol"] ?? 0) + (s.counts["Chute para fora"] ?? 0),
                  },
                  { l: "Desarmes", v: s.counts["Desarme"] ?? 0 },
                  { l: "Cartões", v: s.counts["Cartão amarelo"] ?? 0 },
                  { l: "Distância total", v: `${(s.physical.distance / 1000).toFixed(1)} km` },
                  { l: "Vel. máx histórica", v: `${s.physical.maxSpeed || athlete.maxSpeed} km/h` },
                ].map((i) => (
                  <div key={i.l} className="rounded-lg border border-border bg-secondary/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {i.l}
                    </p>
                    <p className="stat-number mt-1 text-xl">{i.v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Use os filtros de período em Desempenho para recortar últimos 5, 10 jogos, último mês
                ou temporada completa.
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="gap-0 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                Nota da última partida
              </h3>
              <p className="text-xs text-muted-foreground">
                Calculada automaticamente a partir dos eventos registrados no scout
              </p>
            </div>
            <GradePill grade={s.gradeHistory[s.gradeHistory.length - 1]?.nota ?? s.grade} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
