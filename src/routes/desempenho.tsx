import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Map } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ChartPanel, SimpleLine, SkillRadar, TrendBadge } from "@/components/futsal/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDB } from "@/lib/futsal/store";
import { athleteSummary, teamInsights } from "@/lib/futsal/stats";

export const Route = createFileRoute("/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho | Futsal Scout" },
      {
        name: "description",
        content:
          "Evolução histórica, comparação entre atletas, insights automáticos da comissão técnica e mapa de calor.",
      },
      { property: "og:title", content: "Desempenho | Futsal Scout" },
      { property: "og:description", content: "Diagnóstico coletivo e individual com tendências de evolução." },
    ],
  }),
  component: PerformancePage,
});

const FILTERS = [
  { label: "Últimos 5 jogos", value: 5 },
  { label: "Últimos 10 jogos", value: 10 },
  { label: "Último mês", value: 2 },
  { label: "Temporada completa", value: 99 },
];

function PerformancePage() {
  const db = useDB();
  const athletes = db.athletes.filter((a) => a.teamId === db.activeTeamId);
  const [lastN, setLastN] = useState(99);
  const [compare, setCompare] = useState<string[]>(athletes.slice(0, 2).map((a) => a.id));
  const summaries = athletes.map((a) => athleteSummary(db, a.id, lastN));
  const insights = teamInsights(db, db.activeTeamId);

  const evoData =
    summaries[0]?.gradeHistory.map((_, i) => {
      const row: Record<string, string | number> = { label: summaries[0]!.gradeHistory[i]!.label };
      summaries.slice(0, 5).forEach((s) => (row[s.athlete.name] = s.gradeHistory[i]?.passes ?? 0));
      return row;
    }) ?? [];

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <AppShell title="Desempenho" subtitle="Evolução, comparação e insights">
      <Tabs defaultValue="evolucao">
        <TabsList className="flex-wrap">
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          <TabsTrigger value="insights">Insights da Comissão</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.label}
                size="sm"
                variant={lastN === f.value ? "default" : "outline"}
                onClick={() => setLastN(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <ChartPanel title="Precisão de passes por atleta" description="Evolução ao longo das partidas">
            <SimpleLine
              data={evoData}
              domain={[40, 100]}
              height={320}
              keys={summaries.slice(0, 5).map((s, i) => ({
                key: s.athlete.name,
                name: s.athlete.name,
                color: colors[i % colors.length]!,
              }))}
            />
          </ChartPanel>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {summaries.map((s) => (
              <Card key={s.athlete.id} className="gap-0 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate font-display text-lg font-bold uppercase">{s.athlete.name}</p>
                  <TrendBadge trend={s.trend} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.gradeHistory.map((g) => `${g.passes}%`).join(" → ")}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparacao" className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ChartPanel title="Radar comparativo" description="Selecione atletas para comparar">
            <SkillRadar
              height={360}
              series={summaries
                .filter((s) => compare.includes(s.athlete.id))
                .map((s, i) => ({ name: s.athlete.name, color: colors[i % colors.length]!, data: s.radar }))}
            />
          </ChartPanel>
          <Card className="gap-0 p-4">
            <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
              Atletas comparados
            </h3>
            <div className="flex flex-col gap-2">
              {summaries.map((s) => {
                const on = compare.includes(s.athlete.id);
                return (
                  <button
                    key={s.athlete.id}
                    onClick={() =>
                      setCompare(
                        on
                          ? compare.filter((id) => id !== s.athlete.id)
                          : [...compare, s.athlete.id].slice(-4),
                      )
                    }
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2.5 text-left ${
                      on ? "border-primary bg-primary/10" : "border-border bg-secondary/40"
                    }`}
                  >
                    <span className="truncate text-sm font-semibold">
                      {s.athlete.shirt} • {s.athlete.name}
                    </span>
                    <Badge variant="secondary">{s.athlete.position}</Badge>
                  </button>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-4 grid gap-3 md:grid-cols-2">
          {insights.map((i, idx) => (
            <Card
              key={idx}
              className={`gap-0 border-l-4 p-4 ${
                i.tone === "positive"
                  ? "border-l-primary"
                  : i.tone === "negative"
                    ? "border-l-destructive"
                    : "border-l-accent"
              }`}
            >
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <Brain className="h-4 w-4" /> Insight automático
              </p>
              <p className="mt-2 text-sm">{i.text}</p>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card className="gap-0 p-4">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wide">
              <Map className="h-4 w-4 text-primary" /> Mapa de calor da quadra
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Espaço reservado para a futura implementação do heatmap com regiões de atuação.
            </p>
            <div className="mt-4 aspect-[2/1] w-full rounded-xl border-2 border-primary/30 bg-secondary/40 p-3">
              <div className="grid h-full grid-cols-3 gap-2">
                {["Defesa", "Meio", "Ataque"].map((zone) => (
                  <div
                    key={zone}
                    className="grid grid-rows-2 gap-2 rounded-lg border border-dashed border-border p-2"
                  >
                    {["Lado esquerdo", "Lado direito"].map((side) => (
                      <div
                        key={side}
                        className="grid place-items-center rounded-md bg-primary/10 text-center text-[11px] uppercase tracking-wide text-muted-foreground"
                      >
                        {zone} • {side}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
