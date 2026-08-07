import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDB } from "@/lib/futsal/store";
import { athleteSummary, recommendations } from "@/lib/futsal/stats";

export const Route = createFileRoute("/treinamentos")({
  head: () => ({
    meta: [
      { title: "Treinamentos | Futsal Scout" },
      {
        name: "description",
        content:
          "Recomendações automáticas de treinamento geradas a partir das fragilidades técnicas e físicas de cada atleta.",
      },
      { property: "og:title", content: "Treinamentos | Futsal Scout" },
      { property: "og:description", content: "Do diagnóstico ao exercício prescrito para cada jogador." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  const db = useDB();
  const athletes = db.athletes.filter((a) => a.teamId === db.activeTeamId);

  return (
    <AppShell title="Treinamentos" subtitle="Recomendações automáticas por atleta">
      <div className="grid gap-4 xl:grid-cols-2">
        {athletes.map((a) => {
          const s = athleteSummary(db, a.id);
          const recs = recommendations(s);
          return (
            <Card key={a.id} className="gap-0 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-bold uppercase">
                    {a.shirt} — {a.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {a.position} • nota média {s.grade.toFixed(1)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/atletas/$athleteId" params={{ athleteId: a.id }}>
                    Perfil
                  </Link>
                </Button>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {recs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sem fragilidades críticas — manter plano de manutenção.
                  </p>
                ) : null}
                {recs.map((r) => (
                  <div key={r.problem} className="rounded-xl border border-border bg-secondary/40 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-destructive">
                      {r.problem}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                      <Dumbbell className="h-4 w-4 text-primary" /> {r.recommendation}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
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
          );
        })}
      </div>
    </AppShell>
  );
}
