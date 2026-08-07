import type {
  Athlete,
  Match,
  MatchEvent,
  MatchPlayer,
  PhysicalData,
  Substitution,
  Team,
  EventType,
} from "./types";

let seed = 20260807;
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
function ri(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

export const seedTeams: Team[] = [
  {
    id: "t1",
    name: "Futsal Academy Sub-15",
    category: "Sub-15",
    season: "2026",
    coach: "Marcelo Andrade",
    assistant: "Diego Prado",
    fitnessCoach: "Renata Lopes",
  },
  {
    id: "t2",
    name: "Futsal Academy Sub-17",
    category: "Sub-17",
    season: "2026",
    coach: "Marcelo Andrade",
    assistant: "Tiago Freitas",
    fitnessCoach: "Renata Lopes",
  },
  {
    id: "t3",
    name: "Futsal Academy Adulto",
    category: "Adulto",
    season: "2026",
    coach: "Cláudio Menezes",
    assistant: "Diego Prado",
    fitnessCoach: "Bruno Sato",
  },
];

export const seedAthletes: Athlete[] = [
  a("a1", "João Ribeiro", 10, "Ala direita", "Direito", "2011-03-14", 168, 58),
  a("a2", "Lucas Ferraz", 7, "Fixo", "Direito", "2011-07-02", 172, 63),
  a("a3", "Pedro Almeida", 8, "Pivô", "Esquerdo", "2011-01-25", 175, 67),
  a("a4", "Gabriel Souza", 5, "Ala esquerda", "Esquerdo", "2011-09-11", 166, 56),
  a("a5", "Rafael Moraes", 1, "Goleiro", "Direito", "2011-05-30", 178, 70),
  a("a6", "Matheus Lima", 11, "Ala direita", "Direito", "2011-11-08", 164, 55),
  a("a7", "Enzo Cardoso", 4, "Fixo", "Direito", "2011-02-19", 170, 61),
  a("a8", "Vitor Nunes", 9, "Pivô", "Direito", "2011-06-21", 173, 65),
  a("a9", "Caio Bastos", 12, "Goleiro", "Ambidestro", "2011-08-03", 176, 68),
];

function a(
  id: string,
  name: string,
  shirt: number,
  position: Athlete["position"],
  foot: Athlete["foot"],
  birthDate: string,
  height: number,
  weight: number,
): Athlete {
  return {
    id,
    teamId: "t1",
    name,
    shirt,
    position,
    foot,
    birthDate,
    height,
    weight,
    avgHr: ri(158, 172),
    maxHr: ri(188, 201),
    maxSpeed: Number((22 + rnd() * 5).toFixed(1)),
    avgDistance: ri(3200, 4600),
  };
}

const finishedMeta = [
  { id: "m1", opponent: "Vila Nova Futsal", date: "2026-06-14", competition: "Liga Estadual", venue: "Ginásio Municipal", homeAway: "Casa" as const, us: 4, them: 2 },
  { id: "m2", opponent: "AD Cruzeiro do Sul", date: "2026-06-28", competition: "Liga Estadual", venue: "Ginásio Cruzeiro", homeAway: "Fora" as const, us: 2, them: 3 },
  { id: "m3", opponent: "Instituto Bola na Rede", date: "2026-07-12", competition: "Copa Metropolitana", venue: "Arena Norte", homeAway: "Casa" as const, us: 5, them: 1 },
  { id: "m4", opponent: "Sport Clube Aliança", date: "2026-07-26", competition: "Copa Metropolitana", venue: "Ginásio Aliança", homeAway: "Fora" as const, us: 3, them: 3 },
  { id: "m5", opponent: "Real Futsal Clube", date: "2026-08-02", competition: "Liga Estadual", venue: "Ginásio Municipal", homeAway: "Casa" as const, us: 6, them: 2 },
];

export const seedMatches: Match[] = [
  ...finishedMeta.map((m) => ({
    id: m.id,
    teamId: "t1",
    opponent: m.opponent,
    date: m.date,
    time: "19:30",
    competition: m.competition,
    venue: m.venue,
    category: "Sub-15",
    homeAway: m.homeAway,
    status: "finalizada" as const,
    scoreUs: m.us,
    scoreThem: m.them,
    period: 2 as const,
    clockSeconds: 1200,
    running: false,
    teamFouls: { 1: ri(3, 6), 2: ri(2, 6) } as Match["teamFouls"],
  })),
  {
    id: "m6",
    teamId: "t1",
    opponent: "Atlético Praia Grande",
    date: "2026-08-15",
    time: "20:00",
    competition: "Liga Estadual",
    venue: "Ginásio Municipal",
    category: "Sub-15",
    homeAway: "Casa",
    status: "agendada",
    scoreUs: 0,
    scoreThem: 0,
    period: 1,
    clockSeconds: 0,
    running: false,
    teamFouls: { 1: 0, 2: 0 },
  },
];

const starters = ["a5", "a2", "a1", "a4", "a3"];

export const seedMatchPlayers: MatchPlayer[] = [];
export const seedEvents: MatchEvent[] = [];
export const seedPhysical: PhysicalData[] = [];
export const seedSubs: Substitution[] = [];

const attackProfile: Record<string, number> = { a1: 1.2, a3: 1.35, a8: 1.2, a6: 1, a4: 1.05, a2: 0.7, a7: 0.65, a5: 0.3, a9: 0.3 };
const defenseProfile: Record<string, number> = { a2: 1.4, a7: 1.35, a4: 1, a1: 0.8, a3: 0.6, a6: 0.7, a8: 0.6, a5: 0.9, a9: 0.9 };

let evId = 0;
function pushEvent(matchId: string, athleteId: string, type: EventType, period: 1 | 2) {
  seedEvents.push({
    id: `e${++evId}`,
    matchId,
    athleteId,
    eventType: type,
    timestamp: ri(5, 1195),
    period,
    createdAt: evId,
  });
}

seedMatches
  .filter((m) => m.status === "finalizada")
  .forEach((match, matchIndex) => {
    seedAthletes.forEach((ath) => {
      const isStarter = starters.includes(ath.id);
      const role = ath.position === "Goleiro" ? "Goleiro" : isStarter ? "Titular" : "Reserva";
      const minutes = ath.id === "a5" ? 40 : isStarter ? ri(26, 36) : ri(8, 20);
      seedMatchPlayers.push({
        matchId: match.id,
        athleteId: ath.id,
        role,
        onCourt: false,
        minutesPlayed: minutes,
        benchMinutes: 40 - minutes,
      });

      // progressão ao longo das partidas (evolução)
      const growth = 1 + matchIndex * 0.05;
      const atk = (attackProfile[ath.id] ?? 1) * growth;
      const def = (defenseProfile[ath.id] ?? 1) * growth;
      const load = minutes / 32;

      const passesOk = Math.round(ri(14, 26) * atk * load + 4);
      const passesBad = Math.max(1, Math.round(ri(5, 11) * load * (2 - growth)));
      for (let i = 0; i < passesOk; i++) pushEvent(match.id, ath.id, "Passe certo", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < passesBad; i++) pushEvent(match.id, ath.id, "Passe errado", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < Math.round(ri(0, 4) * atk); i++) pushEvent(match.id, ath.id, "Chute a gol", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < ri(0, 3); i++) pushEvent(match.id, ath.id, "Chute para fora", 1);
      for (let i = 0; i < ri(0, 2); i++) pushEvent(match.id, ath.id, "Chute bloqueado", 2);
      for (let i = 0; i < Math.round(rnd() * 2 * atk); i++) pushEvent(match.id, ath.id, "Gol", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < Math.round(rnd() * 1.6 * atk); i++) pushEvent(match.id, ath.id, "Assistência", 2);
      for (let i = 0; i < ri(1, 5); i++) pushEvent(match.id, ath.id, "Perda de bola", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < Math.round(ri(0, 4) * atk); i++) pushEvent(match.id, ath.id, "Drible certo", 1);
      for (let i = 0; i < ri(0, 3); i++) pushEvent(match.id, ath.id, "Drible errado", 2);
      for (let i = 0; i < Math.round(ri(1, 6) * def); i++) pushEvent(match.id, ath.id, "Desarme", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < Math.round(ri(0, 4) * def); i++) pushEvent(match.id, ath.id, "Interceptação", 2);
      for (let i = 0; i < Math.round(ri(0, 3) * def); i++) pushEvent(match.id, ath.id, "Recuperação de bola", 1);
      for (let i = 0; i < Math.round(ri(0, 2) * def); i++) pushEvent(match.id, ath.id, "Bloqueio", 2);
      for (let i = 0; i < ri(0, 2); i++) pushEvent(match.id, ath.id, "Erro defensivo", 1);
      for (let i = 0; i < ri(0, 3); i++) pushEvent(match.id, ath.id, "Falta cometida", i % 2 === 0 ? 1 : 2);
      for (let i = 0; i < ri(0, 3); i++) pushEvent(match.id, ath.id, "Falta sofrida", 2);
      if (rnd() > 0.82) pushEvent(match.id, ath.id, "Cartão amarelo", 2);
      for (let i = 0; i < ri(0, 3); i++) pushEvent(match.id, ath.id, "Roubo de bola", 1);
      for (let i = 0; i < ri(0, 2); i++) pushEvent(match.id, ath.id, "Erro de domínio", 2);
      for (let i = 0; i < ri(0, 2); i++) pushEvent(match.id, ath.id, "Participação em jogada de gol", 1);

      const distance = Math.round((ath.avgDistance * (0.85 + rnd() * 0.3) * minutes) / 32);
      seedPhysical.push({
        matchId: match.id,
        athleteId: ath.id,
        distance,
        avgSpeed: Number((distance / 1000 / (minutes / 60)).toFixed(1)),
        maxSpeed: Number((ath.maxSpeed - rnd() * 3).toFixed(1)),
        avgHr: ath.avgHr + ri(-6, 6),
        maxHr: ath.maxHr + ri(-4, 3),
        sprints: ri(9, 28),
        highIntensityMin: Number((minutes * 0.22).toFixed(1)),
        moderateIntensityMin: Number((minutes * 0.44).toFixed(1)),
        lowIntensityMin: Number((minutes * 0.34).toFixed(1)),
        calories: Math.round(minutes * ri(9, 13)),
        source: "Manual",
      });
    });

    seedSubs.push(
      { id: `s${match.id}-1`, matchId: match.id, outId: "a1", inId: "a6", minute: 12, period: 1 },
      { id: `s${match.id}-2`, matchId: match.id, outId: "a3", inId: "a8", minute: 8, period: 2 },
      { id: `s${match.id}-3`, matchId: match.id, outId: "a2", inId: "a7", minute: 14, period: 2 },
    );
  });

// Partida agendada: escalação já relacionada
seedAthletes.forEach((ath) => {
  seedMatchPlayers.push({
    matchId: "m6",
    athleteId: ath.id,
    role: ath.position === "Goleiro" ? "Goleiro" : starters.includes(ath.id) ? "Titular" : "Reserva",
    onCourt: starters.includes(ath.id),
    minutesPlayed: 0,
    benchMinutes: 0,
  });
});
