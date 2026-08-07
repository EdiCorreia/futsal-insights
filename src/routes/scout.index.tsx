import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Radio } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/futsal/store";

export const Route = createFileRoute("/scout/")({
  head: () => ({
    meta: [
      { title: "Scout ao Vivo | Futsal Scout" },
      {
        name: "description",
        content: "Escolha a partida e registre cada acontecimento em dois toques direto do tablet.",
      },
      { property: "og:title", content: "Scout ao Vivo | Futsal Scout" },
      { property: "og:description", content: "Registro em tempo real otimizado para tablet." },
    ],
  }),
  component: ScoutIndex,
});

function ScoutIndex() {
  const db = useDB();
  const team = db.teams.find((t) => t.id === db.activeTeamId)!;
  const pending = db.matches.filter((m) => m.teamId === team.id && m.status !== "finalizada");
  const done = db.matches.filter((m) => m.teamId === team.id && m.status === "finalizada").slice(-3);

  return (
    <AppShell title="Scout ao Vivo" subtitle="Selecione a partida para iniciar o registro">
      <div className="grid gap-4 md:grid-cols-2">
        {pending.map((m) => (
          <Card key={m.id} className="hero-pitch gap-0 border-primary/30 p-5">
            <Badge className="w-fit">
              <Radio className="mr-1 h-3 w-3" /> Pronta para o scout
            </Badge>
            <h3 className="mt-3 font-display text-2xl font-bold uppercase">
              {team.category} x {m.opponent}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR")} • {m.time} • {m.venue}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {db.matchPlayers.filter((p) => p.matchId === m.id).length} atletas relacionados •{" "}
              {db.matchPlayers.filter((p) => p.matchId === m.id && p.onCourt).length} em quadra
            </p>
            <Button asChild className="mt-5 h-14 font-display text-lg font-bold uppercase tracking-wide">
              <Link to="/scout/$matchId" params={{ matchId: m.id }}>
                <Play className="mr-2 h-5 w-5" /> Iniciar partida
              </Link>
            </Button>
          </Card>
        ))}
        {pending.length === 0 ? (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              Nenhuma partida agendada. Cadastre uma partida na aba Partidas.
            </p>
            <Button asChild variant="outline" className="mt-3">
              <Link to="/partidas">Ir para Partidas</Link>
            </Button>
          </Card>
        ) : null}

        <Card className="gap-0 p-5">
          <h3 className="font-display text-lg font-bold uppercase">Partidas já analisadas</h3>
          <div className="mt-3 flex flex-col gap-2">
            {done.map((m) => (
              <Link
                key={m.id}
                to="/partidas/$matchId"
                params={{ matchId: m.id }}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3 hover:bg-secondary"
              >
                <span className="truncate text-sm font-semibold">vs {m.opponent}</span>
                <span className="stat-number text-primary">
                  {m.scoreUs}-{m.scoreThem}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
