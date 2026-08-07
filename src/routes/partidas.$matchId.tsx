import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Download, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import {
  AthleteAvatar,
  ChartPanel,
  GradePill,
  SimpleBar,
  SimpleLine,
  SimplePie,
  SkillRadar,
  StatCard,
} from "@/components/futsal/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actions, useDB } from "@/lib/futsal/store";
import {
  aggregatePhysical,
  countEvents,
  formatClock,
  matchGrade,
  passAccuracy,
  radarSkills,
  shots,
  teamMatchStats,
} from "@/lib/futsal/stats";
import { GPS_PROVIDERS } from "@/lib/futsal/types";

export const Route = createFileRoute("/partidas/$matchId")({
  head: () => ({
    meta: [
      { title: "Relatório da partida | Futsal Scout" },
      {
        name: "description",
        content:
          "Relatório consolidado da partida: indicadores técnicos, físicos e disciplinares, gráficos e cronologia completa.",
      },
      { property: "og:title", content: "Relatório da partida | Futsal Scout" },
      { property: "og:description", content: "Dados coletivos e individuais consolidados após o jogo." },
    ],
  }),
  component: MatchReport,
});

function MatchReport() {
  const { matchId } = Route.useParams();
  const db = useDB();
  const match = db.matches.find((m) => m.id === matchId);
  if (!match)
    return (
      <AppShell title="Partida">
        <p className="text-muted-foreground">Partida não encontrada.</p>
      </AppShell>
    );

  const team = db.teams.find((t) => t.id === match.teamId)!;
  const st = teamMatchStats(db, matchId);
  const players = db.matchPlayers.filter((p) => p.matchId === matchId);
  const timeline = [...st.events].sort(
    (a, b) => a.period - b.period || a.timestamp - b.timestamp,
  );

  const barData = [
    { name: "Passes ok", v: st.passesOk },
    { name: "Passes err", v: st.passesBad },
    { name: "Finaliz.", v: st.shots },
    { name: "No gol", v: st.shotsOn },
    { name: "Gols", v: st.goals },
    { name: "Desarmes", v: st.tackles },
    { name: "Intercept.", v: st.interceptions },
    { name: "Perdas", v: st.losses },
    { name: "Faltas", v: st.fouls },
  ];

  const pieData = [
    { name: "Passes certos", value: st.passesOk, color: "var(--chart-1)" },
    { name: "Passes errados", value: st.passesBad, color: "var(--chart-4)" },
    { name: "Perdas de bola", value: st.losses, color: "var(--chart-3)" },
    { name: "Desarmes", value: st.tackles, color: "var(--chart-2)" },
  ];

  const minuteBuckets = Array.from({ length: 8 }, (_, i) => {
    const from = i * 5;
    const events = timeline.filter(
      (e) => Math.floor(e.timestamp / 60) >= from && Math.floor(e.timestamp / 60) < from + 5,
    );
    return { label: `${from}-${from + 5}'`, acoes: events.length, gols: events.filter((e) => e.eventType === "Gol").length };
  });

  const teamRadar = radarSkills(
    st.counts,
    db.physical.filter((p) => p.matchId === matchId),
    db.athletes[0]!,
    1,
  );

  return (
    <AppShell
      title={`${team.category} ${match.scoreUs} x ${match.scoreThem} ${match.opponent}`}
      subtitle={`${new Date(match.date + "T12:00:00").toLocaleDateString("pt-BR")} • ${match.competition} • ${match.venue}`}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Relatório PDF gerado (demonstração)")}
          >
            <Download className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/partidas">
              <ArrowLeft className="mr-1 h-4 w-4" /> Partidas
            </Link>
          </Button>
        </>
      }
    >
      <Tabs defaultValue="equipe">
        <TabsList className="flex-wrap">
          <TabsTrigger value="equipe">Relatório da equipe</TabsTrigger>
          <TabsTrigger value="atletas">Individual</TabsTrigger>
          <TabsTrigger value="timeline">Cronologia</TabsTrigger>
          <TabsTrigger value="fisico">Dados GPS</TabsTrigger>
        </TabsList>

        <TabsContent value="equipe" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Passes certos" value={st.passesOk} tone="primary" />
            <StatCard label="Passes errados" value={st.passesBad} tone="warning" />
            <StatCard label="Aproveitamento de passes" value={`${st.passAccuracy}%`} tone="accent" />
            <StatCard label="Finalizações" value={st.shots} hint={`${st.shotsOn} no gol`} />
            <StatCard label="Gols" value={st.goals} tone="primary" hint={`${st.assists} assistências`} />
            <StatCard label="Desarmes" value={st.tackles} hint={`${st.interceptions} interceptações`} />
            <StatCard label="Perdas de bola" value={st.losses} tone="warning" />
            <StatCard
              label="Faltas / cartões"
              value={`${st.fouls} / ${st.yellow}A`}
              tone="destructive"
              hint={`Faltas coletivas 1ºT ${match.teamFouls[1]} • 2ºT ${match.teamFouls[2]}`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel title="Indicadores técnicos" description="Totais da equipe na partida">
              <SimpleBar data={barData} keys={[{ key: "v", name: "Total", color: "var(--chart-1)" }]} />
            </ChartPanel>
            <ChartPanel title="Distribuição de ações" description="Participação por tipo de ação">
              <SimplePie data={pieData} />
            </ChartPanel>
            <ChartPanel title="Radar coletivo" description="Perfil da equipe nesta partida">
              <SkillRadar series={[{ name: team.category, color: "var(--chart-2)", data: teamRadar }]} />
            </ChartPanel>
            <ChartPanel title="Linha temporal" description="Ações registradas por faixa de 5 minutos">
              <SimpleLine
                data={minuteBuckets}
                keys={[
                  { key: "acoes", name: "Ações", color: "var(--chart-1)" },
                  { key: "gols", name: "Gols", color: "var(--chart-4)" },
                ]}
              />
            </ChartPanel>
          </div>
        </TabsContent>

        <TabsContent value="atletas" className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((p) => {
            const ath = db.athletes.find((a) => a.id === p.athleteId)!;
            const counts = countEvents(st.events.filter((e) => e.athleteId === p.athleteId));
            const grade = matchGrade(counts, p.minutesPlayed);
            const ph = db.physical.find((x) => x.matchId === matchId && x.athleteId === p.athleteId);
            return (
              <Card key={p.athleteId} className="gap-0 p-4">
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <AthleteAvatar name={ath.name} shirt={ath.shirt} />
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-bold uppercase">{ath.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.role} • {p.minutesPlayed} min em quadra • {p.benchMinutes} min banco
                    </p>
                  </div>
                  <GradePill grade={grade} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { l: "Gols", v: counts["Gol"] ?? 0 },
                    { l: "Assist.", v: counts["Assistência"] ?? 0 },
                    { l: "Passes", v: `${passAccuracy(counts)}%` },
                    { l: "Finaliz.", v: shots(counts) },
                    { l: "Desarmes", v: counts["Desarme"] ?? 0 },
                    { l: "Perdas", v: counts["Perda de bola"] ?? 0 },
                  ].map((i) => (
                    <div key={i.l} className="rounded-lg bg-secondary/50 p-2">
                      <p className="stat-number text-base">{i.v}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">{i.l}</p>
                    </div>
                  ))}
                </div>
                {ph ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {ph.distance} m • {ph.maxSpeed} km/h máx • FC {ph.avgHr}/{ph.maxHr} • {ph.sprints}{" "}
                    sprints
                  </p>
                ) : null}
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/atletas/$athleteId" params={{ athleteId: ath.id }}>
                    Perfil completo
                  </Link>
                </Button>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="gap-0 p-4">
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                Cronologia da partida ({timeline.length} eventos)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Relatório compartilhado (demonstração)")}
              >
                <Share2 className="mr-1 h-4 w-4" /> Compartilhar
              </Button>
            </div>
            <div className="max-h-[560px] overflow-y-auto pr-1">
              <ul className="flex flex-col gap-1.5">
                {timeline.map((e) => {
                  const ath = db.athletes.find((a) => a.id === e.athleteId);
                  return (
                    <li
                      key={e.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2"
                    >
                      <span className="stat-number w-14 text-sm text-primary">
                        {formatClock(e.timestamp)}
                      </span>
                      <span className="min-w-0 truncate text-sm">
                        <strong className="font-semibold">{ath?.name}</strong> — {e.eventType}
                      </span>
                      <Badge variant="secondary" className="shrink-0">
                        {e.period}º T
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir evento"
                        onClick={() => {
                          actions.deleteEvent(e.id);
                          toast.success("Evento excluído");
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fisico" className="mt-4">
          <PhysicalTab matchId={matchId} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function PhysicalTab({ matchId }: { matchId: string }) {
  const db = useDB();
  const players = db.matchPlayers.filter((p) => p.matchId === matchId);
  const [athleteId, setAthleteId] = useState(players[0]?.athleteId ?? "");
  const existing = db.physical.find((p) => p.matchId === matchId && p.athleteId === athleteId);
  const [source, setSource] = useState(existing?.source ?? "Manual");
  const [values, setValues] = useState<Record<string, string>>({});

  const fields = [
    ["distance", "Distância percorrida (m)"],
    ["avgSpeed", "Velocidade média (km/h)"],
    ["maxSpeed", "Velocidade máxima (km/h)"],
    ["avgHr", "Frequência cardíaca média"],
    ["maxHr", "Frequência cardíaca máxima"],
    ["sprints", "Número de sprints"],
    ["highIntensityMin", "Tempo em alta intensidade (min)"],
    ["moderateIntensityMin", "Tempo em intensidade moderada (min)"],
    ["lowIntensityMin", "Tempo em baixa intensidade (min)"],
    ["calories", "Calorias estimadas"],
  ] as const;

  const save = () => {
    actions.setPhysical({
      matchId,
      athleteId,
      distance: num("distance"),
      avgSpeed: num("avgSpeed"),
      maxSpeed: num("maxSpeed"),
      avgHr: num("avgHr"),
      maxHr: num("maxHr"),
      sprints: num("sprints"),
      highIntensityMin: num("highIntensityMin"),
      moderateIntensityMin: num("moderateIntensityMin"),
      lowIntensityMin: num("lowIntensityMin"),
      calories: num("calories"),
      source,
    });
    toast.success("Dados físicos salvos");
    setValues({});
  };

  const num = (k: string) =>
    Number(values[k] ?? (existing ? (existing as unknown as Record<string, number>)[k] : 0)) || 0;

  const agg = aggregatePhysical(db.physical.filter((p) => p.matchId === matchId));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="gap-0 p-4">
        <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
          Dados físicos da partida
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2">Atleta</th>
                <th className="pb-2">Dist.</th>
                <th className="pb-2">Vel. méd</th>
                <th className="pb-2">Vel. máx</th>
                <th className="pb-2">FC méd</th>
                <th className="pb-2">FC máx</th>
                <th className="pb-2">Sprints</th>
                <th className="pb-2">Alta int.</th>
                <th className="pb-2">Kcal</th>
                <th className="pb-2">Fonte</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const ath = db.athletes.find((a) => a.id === p.athleteId)!;
                const ph = db.physical.find((x) => x.matchId === matchId && x.athleteId === p.athleteId);
                return (
                  <tr key={p.athleteId} className="border-t border-border">
                    <td className="py-2 font-semibold">
                      {ath.shirt} • {ath.name}
                    </td>
                    <td className="py-2">{ph ? `${ph.distance} m` : "—"}</td>
                    <td className="py-2">{ph?.avgSpeed ?? "—"}</td>
                    <td className="py-2">{ph?.maxSpeed ?? "—"}</td>
                    <td className="py-2">{ph?.avgHr ?? "—"}</td>
                    <td className="py-2">{ph?.maxHr ?? "—"}</td>
                    <td className="py-2">{ph?.sprints ?? "—"}</td>
                    <td className="py-2">{ph?.highIntensityMin ?? "—"}</td>
                    <td className="py-2">{ph?.calories ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{ph?.source ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Distância total", v: `${(agg.distance / 1000).toFixed(1)} km` },
            { l: "Vel. máxima", v: `${agg.maxSpeed} km/h` },
            { l: "Sprints", v: agg.sprints },
            { l: "Calorias", v: agg.calories },
          ].map((i) => (
            <div key={i.l} className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{i.l}</p>
              <p className="stat-number mt-1 text-xl">{i.v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="gap-0 p-4">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide">
          Importar / inserir dados
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Arquitetura preparada para integração futura via API com Garmin, Polar, Apple Watch,
          Samsung Galaxy Watch, Catapult e STATSports.
        </p>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-1.5">
            <Label>Atleta</Label>
            <Select value={athleteId} onValueChange={setAthleteId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => {
                  const ath = db.athletes.find((a) => a.id === p.athleteId)!;
                  return (
                    <SelectItem key={p.athleteId} value={p.athleteId}>
                      {ath.shirt} • {ath.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Dispositivo / fonte</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GPS_PROVIDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fields.map(([key, label]) => (
            <div key={key} className="grid gap-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                inputMode="decimal"
                placeholder={String(existing ? (existing as unknown as Record<string, number>)[key] : "")}
                value={values[key] ?? ""}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              />
            </div>
          ))}
          <Button onClick={save} className="font-semibold">
            Salvar dados físicos
          </Button>
          <Button variant="outline" onClick={() => toast.info("Integração por API disponível em versão futura")}>
            Conectar dispositivo GPS
          </Button>
        </div>
      </Card>
    </div>
  );
}
