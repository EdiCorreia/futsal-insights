import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Radio,
  Settings,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDB, actions } from "@/lib/futsal/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/equipes", label: "Equipes", icon: Shield },
  { to: "/atletas", label: "Atletas", icon: Users },
  { to: "/partidas", label: "Partidas", icon: CalendarDays },
  { to: "/scout", label: "Scout ao Vivo", icon: Radio },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/desempenho", label: "Desempenho", icon: Activity },
  { to: "/treinamentos", label: "Treinamentos", icon: Dumbbell },
  { to: "/pdi", label: "PDI dos Atletas", icon: Target },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Activity className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-bold uppercase leading-none tracking-wide">
          Futsal Scout
        </p>
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Performance Lab
        </p>
      </div>
    </div>
  );
}

function TeamSwitcher() {
  const db = useDB();
  return (
    <div className="border-t border-sidebar-border p-3">
      <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Equipe ativa
      </p>
      <div className="flex flex-col gap-1">
        {db.teams.map((t) => (
          <button
            key={t.id}
            onClick={() => actions.setActiveTeam(t.id)}
            className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              db.activeTeamId === t.id
                ? "bg-primary/15 text-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
            }`}
          >
            {t.category}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions: headerActions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const db = useDB();
  const team = db.teams.find((t) => t.id === db.activeTeamId);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col justify-between border-r border-sidebar-border bg-sidebar lg:flex">
        <div>
          <Brand />
          <NavList />
        </div>
        <TeamSwitcher />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <div className="flex h-full flex-col justify-between overflow-y-auto">
                <div>
                  <Brand />
                  <NavList onNavigate={() => setOpen(false)} />
                </div>
                <TeamSwitcher />
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 lg:col-start-2">
            <h1 className="truncate font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
              {title}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {subtitle ?? `${team?.name} • Temporada ${team?.season}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
