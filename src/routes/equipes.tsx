import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
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
import { actions, useDB } from "@/lib/futsal/store";

export const Route = createFileRoute("/equipes")({
  head: () => ({
    meta: [
      { title: "Equipes | Futsal Scout" },
      {
        name: "description",
        content: "Cadastre e gerencie múltiplas equipes por categoria, temporada e comissão técnica.",
      },
      { property: "og:title", content: "Equipes | Futsal Scout" },
      { property: "og:description", content: "Sub-11 a Adulto na mesma conta, com comissão técnica completa." },
    ],
  }),
  component: TeamsPage,
});

const empty = {
  name: "",
  category: "Sub-15",
  season: "2026",
  coach: "",
  assistant: "",
  fitnessCoach: "",
};

function TeamsPage() {
  const db = useDB();
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome da equipe");
      return;
    }
    actions.addTeam(form);
    toast.success("Equipe cadastrada");
    setForm(empty);
    setOpen(false);
  };

  return (
    <AppShell
      title="Equipes"
      subtitle="Todas as categorias da sua conta"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold">
              <Plus className="mr-1 h-4 w-4" /> Nova equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar equipe</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Nome da equipe"],
                  ["category", "Categoria"],
                  ["season", "Temporada"],
                  ["coach", "Treinador"],
                  ["assistant", "Auxiliar técnico"],
                  ["fitnessCoach", "Preparador físico"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="grid gap-1.5">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={submit} className="font-semibold">
                Salvar equipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {db.teams.map((t) => {
          const count = db.athletes.filter((a) => a.teamId === t.id).length;
          const games = db.matches.filter((m) => m.teamId === t.id).length;
          const active = db.activeTeamId === t.id;
          return (
            <Card key={t.id} className={`gap-0 p-5 ${active ? "border-primary/50" : ""}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-bold uppercase">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t.category} • Temporada {t.season}
                  </p>
                </div>
                {active ? <Badge className="shrink-0">Ativa</Badge> : null}
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Treinador</dt>
                  <dd className="truncate font-medium">{t.coach || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Auxiliar técnico</dt>
                  <dd className="truncate font-medium">{t.assistant || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Preparador físico</dt>
                  <dd className="truncate font-medium">{t.fitnessCoach || "—"}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" /> {count} atletas
                </span>
                <span>{games} partidas</span>
              </div>
              <Button
                variant={active ? "secondary" : "outline"}
                className="mt-4"
                onClick={() => actions.setActiveTeam(t.id)}
              >
                {active ? "Equipe selecionada" : "Selecionar equipe"}
              </Button>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
