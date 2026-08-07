import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { GPS_PROVIDERS } from "@/lib/futsal/types";
import { useDB } from "@/lib/futsal/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Futsal Scout" },
      {
        name: "description",
        content:
          "Configure o algoritmo de nota, integrações com dispositivos GPS e preferências da comissão técnica.",
      },
      { property: "og:title", content: "Configurações | Futsal Scout" },
      { property: "og:description", content: "Algoritmo de nota configurável e integrações preparadas." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const db = useDB();
  const team = db.teams.find((t) => t.id === db.activeTeamId)!;

  return (
    <AppShell title="Configurações">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 p-4">
          <h3 className="font-display text-lg font-bold uppercase">Algoritmo de nota</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste o peso de cada indicador no cálculo da nota de 0 a 10.
          </p>
          <div className="mt-4 flex flex-col gap-5">
            {[
              { l: "Peso do passe", v: 35 },
              { l: "Peso da finalização / gol", v: 90 },
              { l: "Peso das ações defensivas", v: 60 },
              { l: "Penalidade por erro", v: 45 },
              { l: "Penalidade disciplinar", v: 40 },
            ].map((s) => (
              <div key={s.l}>
                <div className="flex justify-between text-sm">
                  <Label>{s.l}</Label>
                  <span className="text-muted-foreground">{s.v}%</span>
                </div>
                <Slider defaultValue={[s.v]} max={100} step={5} className="mt-2" />
              </div>
            ))}
          </div>
          <Button className="mt-5" onClick={() => toast.success("Pesos do algoritmo salvos")}>
            Salvar configuração
          </Button>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="gap-0 p-4">
            <h3 className="font-display text-lg font-bold uppercase">Integrações GPS</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Arquitetura preparada. Integrações reais serão habilitadas em versão futura.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GPS_PROVIDERS.filter((g) => g !== "Manual").map((g) => (
                <Badge key={g} variant="secondary">
                  {g} • em breve
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <h3 className="font-display text-lg font-bold uppercase">Preferências do scout</h3>
            <div className="mt-3 flex flex-col gap-4">
              {[
                "Vibração ao registrar evento",
                "Confirmar gols com dois toques",
                "Manter tela ativa durante a partida",
                "Compartilhar relatórios com responsáveis",
              ].map((p, i) => (
                <div key={p} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <Label className="text-sm">{p}</Label>
                  <Switch defaultChecked={i !== 1} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <h3 className="font-display text-lg font-bold uppercase">Conta</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Equipe ativa: <strong className="text-foreground">{team.name}</strong> • {db.teams.length}{" "}
              equipes • {db.athletes.length} atletas
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
