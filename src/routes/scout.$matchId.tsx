import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Flag,
  Pause,
  Play,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actions, useDB } from "@/lib/futsal/store";
import { countEvents, formatClock } from "@/lib/futsal/stats";
import { EVENT_GROUPS, QUICK_EVENTS, type EventType } from "@/lib/futsal/types";

export const Route = createFileRoute("/scout/$matchId")({
  head: () => ({
    meta: [
      { title: "Scout ao vivo | Futsal Scout" },
      {
        name: "description",
        content:
          "Registro de eventos em tempo real com dois toques: selecione o atleta e o acontecimento durante a partida.",
      },
      { property: "og:title", content: "Scout ao vivo | Futsal Scout" },
      { property: "og:description", content: "Tela otimizada para tablet em modo paisagem." },
    ],
  }),
  component: LiveScout,
});

function LiveScout() {
  const { matchId } = Route.useParams();
  const db = useDB();
  const navigate = useNavigate();
  const match = db.matches.find((m) => m.id === matchId);
  const [selected, setSelected] = useState<string | null>(null);
  const [subMode, setSubMode] = useState<string | null>(null);
  const [flash, setFlash] = useState<string>("");

  useEffect(() => {
    if (!match?.running) return;
    const i = setInterval(() => actions.tick(matchId), 1000);
    return () => clearInterval(i);
  }, [match?.running, matchId]);

  if (!match)
    return (
      <div className="grid min-h-screen place-items-center p-8">
        <p className="text-muted-foreground">Partida não encontrada.</p>
      </div>
    );

  const team = db.teams.find((t) => t.id === match.teamId)!;
  const players = db.matchPlayers.filter((p) => p.matchId === matchId);
  const onCourt = players.filter((p) => p.onCourt);
  const bench = players.filter((p) => !p.onCourt);
  const events = db.events.filter((e) => e.matchId === matchId);
  const selectedAthlete = db.athletes.find((a) => a.id === selected);
  const selectedCounts = countEvents(events.filter((e) => e.athleteId === selected));

  const register = (type: EventType) => {
    if (!selected) return;
    actions.addEvent(matchId, selected, type);
    setFlash(type);
    setTimeout(() => setFlash(""), 380);
    toast.success(`${selectedAthlete?.name} — ${type} +1`, { duration: 1200 });
  };

  const athleteOf = (id: string) => db.athletes.find((a) => a.id === id)!;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-3 py-2 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold uppercase sm:text-2xl">
              {team.category}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Faltas 1ºT {match.teamFouls[1]} • 2ºT {match.teamFouls[2]}
            </p>
          </div>
          <div className="flex items-center gap-3 text-center">
            <span className="stat-number text-3xl text-primary sm:text-5xl">{match.scoreUs}</span>
            <div>
              <p className="stat-number text-xl sm:text-3xl">{formatClock(match.clockSeconds)}</p>
              <button
                onClick={() =>
                  actions.patchMatch(matchId, {
                    period: match.period === 1 ? 2 : 1,
                    clockSeconds: 0,
                  })
                }
                className="text-[10px] uppercase tracking-widest text-muted-foreground underline"
              >
                {match.period}º tempo
              </button>
            </div>
            <span className="stat-number text-3xl sm:text-5xl">{match.scoreThem}</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <p className="hidden truncate font-display text-lg font-bold uppercase sm:block sm:text-2xl">
              {match.opponent}
            </p>
            <Button
              size="icon"
              variant="outline"
              aria-label="Gol adversário"
              onClick={() => actions.patchMatch(matchId, { scoreThem: match.scoreThem + 1 })}
            >
              +1
            </Button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            className="h-10 font-bold uppercase"
            onClick={() =>
              actions.patchMatch(matchId, {
                running: !match.running,
                status: match.running ? "ao_vivo" : "ao_vivo",
              })
            }
          >
            {match.running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
            {match.running ? "Pausar" : "Iniciar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-10"
            onClick={() => {
              const last = actions.undoLastEvent(matchId);
              toast.info(last ? `Desfeito: ${last.eventType}` : "Nada para desfazer");
            }}
          >
            <Undo2 className="mr-1 h-4 w-4" /> Desfazer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-10"
            onClick={() => setSubMode(subMode ? null : "out")}
          >
            <ArrowLeftRight className="mr-1 h-4 w-4" /> Substituição
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-10 font-bold uppercase"
            onClick={() => {
              actions.finishMatch(matchId);
              toast.success("Partida finalizada — relatórios gerados");
              navigate({ to: "/partidas/$matchId", params: { matchId } });
            }}
          >
            <Flag className="mr-1 h-4 w-4" /> Finalizar partida
          </Button>
        </div>
      </header>

      <div className="grid flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Em quadra — toque no atleta
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {onCourt.map((p) => {
              const a = athleteOf(p.athleteId);
              const c = countEvents(events.filter((e) => e.athleteId === a.id));
              const active = selected === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => (subMode === "out" ? (setSubMode(a.id), toast.info(`Sai: ${a.name}`)) : setSelected(a.id))}
                  className={`scout-tap rounded-2xl border p-4 text-left ${
                    active
                      ? "border-primary bg-primary/15"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <p className="stat-number text-3xl text-primary">{a.shirt}</p>
                  <p className="mt-1 truncate font-display text-lg font-bold uppercase">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.position}</p>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                    <span>P {c["Passe certo"] ?? 0}/{c["Passe errado"] ?? 0}</span>
                    <span>• G {c["Gol"] ?? 0}</span>
                    <span>• D {c["Desarme"] ?? 0}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mb-2 mt-5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Banco {subMode && subMode !== "out" ? "— toque em quem entra" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {bench.map((p) => {
              const a = athleteOf(p.athleteId);
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    if (subMode && subMode !== "out") {
                      actions.substitute(matchId, subMode, a.id);
                      toast.success(`Entra ${a.name} • ${Math.floor(match.clockSeconds / 60)}'`);
                      setSubMode(null);
                    } else {
                      setSelected(a.id);
                    }
                  }}
                  className="scout-tap rounded-xl border border-border bg-card px-4 py-3 text-left hover:border-primary/40"
                >
                  <p className="font-display text-base font-bold uppercase">
                    {a.shirt} • {a.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{a.position}</p>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          {selectedAthlete ? (
            <div className="surface-panel p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold uppercase">
                    {selectedAthlete.shirt} — {selectedAthlete.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatClock(match.clockSeconds)} • {match.period}º tempo
                  </p>
                </div>
                <Button size="icon" variant="ghost" aria-label="Fechar" onClick={() => setSelected(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <p className="mb-2 mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ações rápidas
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_EVENTS.map((ev) => (
                  <button
                    key={ev}
                    onClick={() => register(ev)}
                    className={`scout-tap min-h-16 rounded-xl border px-3 py-2 text-left font-display text-base font-bold uppercase leading-tight ${
                      flash === ev
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary hover:border-primary/50"
                    }`}
                  >
                    {ev}
                    <span className="block text-xs font-semibold text-muted-foreground">
                      {selectedCounts[ev] ?? 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 max-h-[38vh] overflow-y-auto pr-1">
                {EVENT_GROUPS.map((g) => (
                  <div key={g.category} className="mb-3">
                    <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {g.category}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {g.events.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => register(ev)}
                          className={`scout-tap min-h-12 rounded-lg border px-2 py-2 text-left text-xs font-semibold ${
                            flash === ev
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          {ev}
                          <span className="ml-1 text-muted-foreground">
                            {selectedCounts[ev] ?? 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="surface-panel grid place-items-center p-6 text-center">
              <p className="font-display text-lg uppercase text-muted-foreground">
                Selecione um atleta para registrar eventos
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fluxo de dois toques: atleta → acontecimento
              </p>
            </div>
          )}

          <div className="surface-panel min-h-32 p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Cronologia ({events.length})
              </p>
              <Button asChild size="sm" variant="ghost">
                <Link to="/partidas/$matchId" params={{ matchId }}>
                  Relatório
                </Link>
              </Button>
            </div>
            <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto pr-1 text-sm">
              {[...events]
                .reverse()
                .slice(0, 40)
                .map((e) => (
                  <li key={e.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                    <span className="stat-number w-12 text-xs text-primary">
                      {formatClock(e.timestamp)}
                    </span>
                    <span className="truncate text-xs">
                      {athleteOf(e.athleteId).name} — {e.eventType}
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {e.period}º
                    </Badge>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
