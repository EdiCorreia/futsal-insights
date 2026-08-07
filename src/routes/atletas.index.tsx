import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AthleteAvatar, GradePill, TrendBadge } from "@/components/futsal/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { POSITIONS, type Foot, type Position } from "@/lib/futsal/types";
import { age, athleteSummary } from "@/lib/futsal/stats";

export const Route = createFileRoute("/atletas")({
  head: () => ({
    meta: [
      { title: "Atletas | Futsal Scout" },
      {
        name: "description",
        content:
          "Cadastro rápido de atletas de futsal com posição, pé dominante, dados antropométricos e indicadores físicos.",
      },
      { property: "og:title", content: "Atletas | Futsal Scout" },
      { property: "og:description", content: "Plantel completo com nota média, tendência e perfil individual." },
    ],
  }),
  component: AthletesPage,
});

const empty = {
  name: "",
  shirt: "",
  position: "Ala direita" as Position,
  foot: "Direito" as Foot,
  birthDate: "2011-01-01",
  height: "170",
  weight: "60",
  avgHr: "165",
  maxHr: "195",
  maxSpeed: "24",
  avgDistance: "3800",
};

function AthletesPage() {
  const db = useDB();
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<string>("Todas");
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const athletes = db.athletes
    .filter((a) => a.teamId === db.activeTeamId)
    .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    .filter((a) => pos === "Todas" || a.position === pos)
    .sort((a, b) => a.shirt - b.shirt);

  const submit = () => {
    if (!form.name.trim() || !form.shirt) {
      toast.error("Nome e número da camisa são obrigatórios");
      return;
    }
    actions.addAthlete({
      teamId: db.activeTeamId,
      name: form.name,
      shirt: Number(form.shirt),
      position: form.position,
      foot: form.foot,
      birthDate: form.birthDate,
      height: Number(form.height),
      weight: Number(form.weight),
      avgHr: Number(form.avgHr),
      maxHr: Number(form.maxHr),
      maxSpeed: Number(form.maxSpeed),
      avgDistance: Number(form.avgDistance),
    });
    toast.success(`${form.name} cadastrado`);
    setForm(empty);
    setOpen(false);
  };

  return (
    <AppShell
      title="Atletas"
      subtitle={`${athletes.length} atletas no plantel`}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold">
              <Plus className="mr-1 h-4 w-4" /> Novo atleta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastro rápido de atleta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="name">Nome do atleta</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="shirt">Número da camisa</Label>
                <Input
                  id="shirt"
                  inputMode="numeric"
                  value={form.shirt}
                  onChange={(e) => setForm({ ...form, shirt: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Posição</Label>
                <Select
                  value={form.position}
                  onValueChange={(v) => setForm({ ...form, position: v as Position })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Pé dominante</Label>
                <Select value={form.foot} onValueChange={(v) => setForm({ ...form, foot: v as Foot })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Direito", "Esquerdo", "Ambidestro"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="birth">Data de nascimento</Label>
                <Input
                  id="birth"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
              {(
                [
                  ["height", "Altura (cm)"],
                  ["weight", "Peso (kg)"],
                  ["avgHr", "FC média (bpm)"],
                  ["maxHr", "FC máxima (bpm)"],
                  ["maxSpeed", "Velocidade máx (km/h)"],
                  ["avgDistance", "Distância média (m)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="grid gap-1.5">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    inputMode="decimal"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="photo">Foto do atleta</Label>
                <Input id="photo" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">
                  Opcional — a camisa é usada como identificação visual no scout.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} className="font-semibold">
                Salvar atleta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar atleta"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={pos} onValueChange={setPos}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["Todas", ...POSITIONS].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {athletes.map((a) => {
          const s = athleteSummary(db, a.id);
          return (
            <Card key={a.id} className="gap-0 p-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <AthleteAvatar name={a.name} shirt={a.shirt} />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-bold uppercase">{a.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.position} • {age(a.birthDate)} anos • pé {a.foot.toLowerCase()}
                  </p>
                </div>
                <GradePill grade={s.grade} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Passes", v: `${s.passAccuracy}%` },
                  { l: "Gols", v: s.counts["Gol"] ?? 0 },
                  { l: "Desarmes", v: s.tackles },
                ].map((i) => (
                  <div key={i.l} className="rounded-lg bg-secondary/50 p-2">
                    <p className="stat-number text-lg">{i.v}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{i.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <TrendBadge trend={s.trend} />
                <Badge variant="secondary">
                  {a.height} cm • {a.weight} kg
                </Badge>
              </div>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/atletas/$athleteId" params={{ athleteId: a.id }}>
                  Ver perfil individual
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
