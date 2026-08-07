import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/futsal/store";
import { athleteSummary, teamMatchStats } from "@/lib/futsal/stats";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Futsal Scout" },
      {
        name: "description",
        content:
          "Gere relatórios de partida, atleta, físico, técnico, de evolução e o Plano de Desenvolvimento Individual em PDF.",
      },
      { property: "og:title", content: "Relatórios | Futsal Scout" },
      { property: "og:description", content: "Compartilhe com atletas e responsáveis nas categorias de base." },
    ],
  }),
  component: ReportsPage,
});

const TYPES = [
  "Relatório da partida",
  "Relatório do atleta",
  "Relatório físico",
  "Relatório técnico",
  "Relatório de evolução",
  "Plano de Desenvolvimento Individual",
];

function ReportsPage() {
  const db = useDB();
  const team = db.teams.find((t) => t.id === db.activeTeamId)!;
  const finished = db.matches
    .filter((m) => m.teamId === team.id && m.status === "finalizada")
    .sort((a, b) => b.date.localeCompare(a.date));
  const athletes = db.athletes.filter((a) => a.teamId === team.id);

  return (
    <AppShell title="Relatórios" subtitle="Exportação e compartilhamento">
      <div className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TYPES.map((t) => (
            <Card key={t} className="gap-0 p-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="mt-2 font-display text-lg font-bold uppercase">{t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Gerado automaticamente a partir dos dados consolidados das partidas.
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => toast.success(`${t} em PDF gerado (demonstração)`)}>
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Link enviado ao atleta e responsáveis (demonstração)")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="gap-0 p-4">
          <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
            Relatórios de partida
          </h3>
          <div className="flex flex-col gap-2">
            {finished.map((m) => {
              const st = teamMatchStats(db, m.id);
              return (
                <Link
                  key={m.id}
                  to="/partidas/$matchId"
                  params={{ matchId: m.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {team.category} {m.scoreUs} x {m.scoreThem} {m.opponent}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR")} • {st.events.length}{" "}
                      eventos • passes {st.passAccuracy}%
                    </p>
                  </div>
                  <Badge variant="secondary">Abrir</Badge>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="gap-0 p-4">
          <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide">
            Relatórios individuais
          </h3>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {athletes.map((a) => {
              const s = athleteSummary(db, a.id);
              return (
                <Link
                  key={a.id}
                  to="/atletas/$athleteId"
                  params={{ athleteId: a.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {a.shirt} • {a.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Nota {s.grade.toFixed(1)} • passes {s.passAccuracy}%
                    </p>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
