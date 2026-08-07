import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, MapPin, Play, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actions, useDB } from "@/lib/futsal/store";
import { teamMatchStats } from "@/lib/futsal/stats";

export const Route = createFileRoute("/partidas")({
  head: () => ({
    meta: [
      { title: "Partidas | Futsal Scout" },
      {
        name: "description",
        content:
          "Cadastre partidas de futsal, relacione titulares, reservas e goleiros e inicie o scout ao vivo.",
      },
      { property: "og:title", content: "Partidas | Futsal Scout" },
      { property: "og:description", content: "Agenda, escalação e relatórios consolidados de cada jogo." },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const db = useDB();
  const navigate = useNavigate();
  const team = db.teams.find((t) => t.id === db.activeTeamId)!;
  const athletes = db.athletes.filter((a) => a.teamId === team.id);
  const matches = db.matches
    .filter((m) => m.teamId === team.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    opponent: "",
    date: new Date().toISOString().slice(0, 10),
    time: "20:00",
    competition: "Liga Estadual",
    venue: "Ginásio Municipal",
    homeAway: "Casa" as "Casa" | "Fora",
    type: "Campeonato",
  });
  const [selected, setSelected] = useState<string[]>(athletes.map((a) => a.id));
  const [starters, setStarters] = useState<string[]>(athletes.slice(0, 5).map((a) => a.id));

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);

  const create = (startNow: boolean) => {
    if (!form.opponent.trim()) {
      toast.error("Informe o adversário");
      return;
    }
    if (starters.length !== 5) {
      toast.error("Selecione exatamente 5 titulares");
      return;
    }
    const id = actions.addMatch(
      {
        teamId: team.id,
        opponent: form.opponent,
        date: form.date,
        time: form.time,
        competition: `${form.competition} • ${form.type}`,
        venue: form.venue,
        category: team.category,
        homeAway: form.homeAway,
        status: "agendada",
        scoreUs: 0,
        scoreThem: 0,
        period: 1,
        clockSeconds: 0,
        running: false,
        teamFouls: { 1: 0, 2: 0 },
      },
      selected,
      starters,
    );
    setOpen(false);
    toast.success("Partida criada");
    if (startNow) navigate({ to: "/scout/$matchId", params: { matchId: id } });
  };

  return (
    <AppShell
      title="Partidas"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold">
              <CalendarPlus className="mr-1 h-4 w-4" /> Nova partida
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastro da partida</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="opp">Adversário</Label>
                <Input
                  id="opp"
                  value={form.opponent}
                  onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="comp">Competição</Label>
                <Input
                  id="comp"
                  value={form.competition}
                  onChange={(e) => setForm({ ...form, competition: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="venue">Local</Label>
                <Input
                  id="venue"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Categoria</Label>
                <Input value={team.category} readOnly />
              </div>
              <div className="grid gap-1.5">
                <Label>Tipo de partida</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Campeonato", "Amistoso", "Copa", "Treino jogo"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Casa ou fora</Label>
                <div className="flex gap-2">
                  {(["Casa", "Fora"] as const).map((v) => (
                    <Button
                      key={v}
                      type="button"
                      variant={form.homeAway === v ? "default" : "outline"}
                      onClick={() => setForm({ ...form, homeAway: v })}
                      className="flex-1"
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <p className="mb-2 text-sm font-semibold">
                Relacionados ({selected.length}) • Titulares ({starters.length}/5)
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {athletes.map((a) => {
                  const rel = selected.includes(a.id);
                  const st = starters.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2 ${
                        rel ? "border-primary/40 bg-primary/5" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(selected, setSelected, a.id)}
                        className="min-w-0 text-left"
                      >
                        <p className="truncate text-sm font-semibold">
                          {a.shirt} • {a.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{a.position}</p>
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        variant={st ? "default" : "outline"}
                        onClick={() => toggle(starters, setStarters, a.id)}
                      >
                        {a.position === "Goleiro" ? "Goleiro" : st ? "Titular" : "Reserva"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => create(false)}>
                Salvar partida
              </Button>
              <Button className="font-bold uppercase" onClick={() => create(true)}>
                <Play className="mr-1 h-4 w-4" /> Iniciar partida
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((m) => {
          const st = teamMatchStats(db, m.id);
          const done = m.status === "finalizada";
          return (
            <Card key={m.id} className="gap-0 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR")} • {m.time}
                  </p>
                  <h3 className="truncate font-display text-xl font-bold uppercase">
                    {team.category} x {m.opponent}
                  </h3>
                </div>
                <Badge variant={done ? "secondary" : "default"} className="shrink-0">
                  {done ? "Finalizada" : m.status === "ao_vivo" ? "Ao vivo" : "Agendada"}
                </Badge>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" /> {m.competition}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {m.venue} • {m.homeAway}
              </p>

              {done ? (
                <>
                  <p className="stat-number mt-3 text-4xl">
                    {m.scoreUs}
                    <span className="mx-2 text-muted-foreground">-</span>
                    {m.scoreThem}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-secondary/50 p-2">
                      <p className="stat-number text-lg">{st.passAccuracy}%</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Passes</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-2">
                      <p className="stat-number text-lg">{st.shots}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Finalizações</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-2">
                      <p className="stat-number text-lg">{st.tackles}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Desarmes</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/partidas/$matchId" params={{ matchId: m.id }}>
                      Ver relatório
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="mt-5 h-12 font-bold uppercase tracking-wide">
                  <Link to="/scout/$matchId" params={{ matchId: m.id }}>
                    <Play className="mr-1 h-4 w-4" /> Iniciar partida
                  </Link>
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
