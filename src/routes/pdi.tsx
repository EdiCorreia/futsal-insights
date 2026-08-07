import { createFileRoute, Link } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDB } from "@/lib/futsal/store";
import { athleteSummary, developmentPlan } from "@/lib/futsal/stats";

export const Route = createFileRoute("/pdi")({
  head: () => ({
    meta: [
      { title: "PDI dos Atletas | Futsal Scout" },
      {
        name: "description",
        content:
          "Planos de Desenvolvimento Individual gerados automaticamente com objetivo, indicador atual, meta e prazo.",
      },
      { property: "og:title", content: "PDI dos Atletas | Futsal Scout" },
      { property: "og:description", content: "Metas, prazos e acompanhamento automático da evolução." },
    ],
  }),
  component: PdiPage,
});

function PdiPage() {
  const db = useDB();
  const athletes = db.athletes.filter((a) => a.teamId === db.activeTeamId);

  return (
    <AppShell title="PDI dos Atletas" subtitle="Planos de Desenvolvimento Individual">
      <div className="grid gap-4 xl:grid-cols-2">
        {athletes.map((a) => {
          const s = athleteSummary(db, a.id);
          const plans = developmentPlan(s);
          return (
            <Card key={a.id} className="gap-0 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-bold uppercase">
                    Plano de Desenvolvimento — {a.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {a.position} • camisa {a.shirt} • {plans.length} metas ativas
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/atletas/$athleteId" params={{ athleteId: a.id }}>
                    Perfil
                  </Link>
                </Button>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {plans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todas as metas atingidas — novo ciclo após a próxima partida.
                  </p>
                ) : null}
                {plans.map((p) => (
                  <div key={p.objective} className="rounded-xl border border-border bg-secondary/40 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Target className="h-4 w-4 text-primary" /> {p.objective}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.indicator}: atual {p.current}
                      {p.unit} → meta {p.target}
                      {p.unit} • prazo {p.deadlineDays} dias
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.sessions}</p>
                    <Progress value={Math.min(100, p.progress)} className="mt-2 h-2" />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
