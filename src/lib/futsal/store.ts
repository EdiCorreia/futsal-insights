import { useSyncExternalStore } from "react";
import {
  seedAthletes,
  seedEvents,
  seedMatchPlayers,
  seedMatches,
  seedPhysical,
  seedSubs,
  seedTeams,
} from "./data";
import type {
  Athlete,
  EventType,
  Match,
  MatchEvent,
  MatchPlayer,
  PhysicalData,
  Substitution,
  Team,
} from "./types";

export interface DB {
  teams: Team[];
  athletes: Athlete[];
  matches: Match[];
  matchPlayers: MatchPlayer[];
  events: MatchEvent[];
  physical: PhysicalData[];
  subs: Substitution[];
  activeTeamId: string;
}

let db: DB = {
  teams: seedTeams,
  athletes: seedAthletes,
  matches: seedMatches,
  matchPlayers: seedMatchPlayers,
  events: seedEvents,
  physical: seedPhysical,
  subs: seedSubs,
  activeTeamId: "t1",
};

const listeners = new Set<() => void>();
function emit() {
  db = { ...db };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useDB(): DB {
  return useSyncExternalStore(
    subscribe,
    () => db,
    () => db,
  );
}

export function getDB() {
  return db;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  setActiveTeam(id: string) {
    db.activeTeamId = id;
    emit();
  },
  addTeam(team: Omit<Team, "id">) {
    db.teams = [...db.teams, { ...team, id: uid() }];
    emit();
  },
  addAthlete(athlete: Omit<Athlete, "id">) {
    db.athletes = [...db.athletes, { ...athlete, id: uid() }];
    emit();
  },
  updateAthlete(id: string, patch: Partial<Athlete>) {
    db.athletes = db.athletes.map((a) => (a.id === id ? { ...a, ...patch } : a));
    emit();
  },
  addMatch(match: Omit<Match, "id">, athleteIds: string[], starterIds: string[]) {
    const id = uid();
    db.matches = [...db.matches, { ...match, id }];
    db.matchPlayers = [
      ...db.matchPlayers,
      ...athleteIds.map((athleteId) => {
        const ath = db.athletes.find((a) => a.id === athleteId);
        return {
          matchId: id,
          athleteId,
          role:
            ath?.position === "Goleiro"
              ? ("Goleiro" as const)
              : starterIds.includes(athleteId)
                ? ("Titular" as const)
                : ("Reserva" as const),
          onCourt: starterIds.includes(athleteId),
          minutesPlayed: 0,
          benchMinutes: 0,
        };
      }),
    ];
    emit();
    return id;
  },
  patchMatch(id: string, patch: Partial<Match>) {
    db.matches = db.matches.map((m) => (m.id === id ? { ...m, ...patch } : m));
    emit();
  },
  tick(id: string) {
    db.matches = db.matches.map((m) =>
      m.id === id && m.running ? { ...m, clockSeconds: Math.min(m.clockSeconds + 1, 1200) } : m,
    );
    emit();
  },
  addEvent(matchId: string, athleteId: string, eventType: EventType) {
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) return;
    db.events = [
      ...db.events,
      {
        id: uid(),
        matchId,
        athleteId,
        eventType,
        timestamp: match.clockSeconds,
        period: match.period,
        createdAt: Date.now(),
      },
    ];
    if (eventType === "Gol") {
      db.matches = db.matches.map((m) => (m.id === matchId ? { ...m, scoreUs: m.scoreUs + 1 } : m));
    }
    if (eventType === "Falta cometida") {
      db.matches = db.matches.map((m) =>
        m.id === matchId
          ? { ...m, teamFouls: { ...m.teamFouls, [m.period]: m.teamFouls[m.period] + 1 } }
          : m,
      );
    }
    emit();
  },
  undoLastEvent(matchId: string) {
    const own = db.events.filter((e) => e.matchId === matchId);
    const last = own[own.length - 1];
    if (!last) return;
    db.events = db.events.filter((e) => e.id !== last.id);
    if (last.eventType === "Gol") {
      db.matches = db.matches.map((m) =>
        m.id === matchId ? { ...m, scoreUs: Math.max(0, m.scoreUs - 1) } : m,
      );
    }
    emit();
    return last;
  },
  deleteEvent(id: string) {
    db.events = db.events.filter((e) => e.id !== id);
    emit();
  },
  updateEvent(id: string, patch: Partial<MatchEvent>) {
    db.events = db.events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    emit();
  },
  substitute(matchId: string, outId: string, inId: string) {
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) return;
    const minute = Math.floor(match.clockSeconds / 60);
    db.subs = [...db.subs, { id: uid(), matchId, outId, inId, minute, period: match.period }];
    db.matchPlayers = db.matchPlayers.map((mp) => {
      if (mp.matchId !== matchId) return mp;
      if (mp.athleteId === outId) return { ...mp, onCourt: false };
      if (mp.athleteId === inId) return { ...mp, onCourt: true };
      return mp;
    });
    emit();
  },
  setPhysical(data: PhysicalData) {
    const exists = db.physical.some(
      (p) => p.matchId === data.matchId && p.athleteId === data.athleteId,
    );
    db.physical = exists
      ? db.physical.map((p) =>
          p.matchId === data.matchId && p.athleteId === data.athleteId ? data : p,
        )
      : [...db.physical, data];
    emit();
  },
  finishMatch(matchId: string) {
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) return;
    db.matchPlayers = db.matchPlayers.map((mp) => {
      if (mp.matchId !== matchId) return mp;
      const played = mp.onCourt ? Math.round(match.clockSeconds / 60) + (match.period === 2 ? 20 : 0) : 0;
      return { ...mp, minutesPlayed: played || mp.minutesPlayed, benchMinutes: Math.max(0, 40 - played) };
    });
    db.matches = db.matches.map((m) =>
      m.id === matchId ? { ...m, status: "finalizada" as const, running: false } : m,
    );
    emit();
  },
};
