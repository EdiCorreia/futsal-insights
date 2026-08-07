import type { DB } from "./store";
import type { Athlete, EventType, MatchEvent, PhysicalData } from "./types";

export type Counts = Partial<Record<EventType, number>>;

export function countEvents(events: MatchEvent[]): Counts {
  return events.reduce<Counts>((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] ?? 0) + 1;
    return acc;
  }, {});
}

export const c = (counts: Counts, key: EventType) => counts[key] ?? 0;

export function passAccuracy(counts: Counts) {
  const ok = c(counts, "Passe certo");
  const bad = c(counts, "Passe errado");
  return ok + bad === 0 ? 0 : Math.round((ok / (ok + bad)) * 100);
}

export function shots(counts: Counts) {
  return c(counts, "Chute a gol") + c(counts, "Chute para fora") + c(counts, "Chute bloqueado");
}

export function shotEfficiency(counts: Counts) {
  const total = shots(counts);
  return total === 0 ? 0 : Math.round((c(counts, "Gol") / total) * 100);
}

export function tackles(counts: Counts) {
  return c(counts, "Desarme") + c(counts, "Interceptação") + c(counts, "Roubo de bola");
}

/** Nota automática de 0 a 10 */
export function matchGrade(counts: Counts, minutes: number): number {
  const base = 6;
  const load = Math.max(minutes, 8) / 30;
  let score = base;
  score += c(counts, "Passe certo") * 0.035;
  score -= c(counts, "Passe errado") * 0.05;
  score += c(counts, "Gol") * 0.9;
  score += c(counts, "Assistência") * 0.6;
  score += c(counts, "Chute a gol") * 0.12;
  score += c(counts, "Drible certo") * 0.1;
  score -= c(counts, "Drible errado") * 0.05;
  score += tackles(counts) * 0.15;
  score += c(counts, "Bloqueio") * 0.12;
  score += c(counts, "Recuperação de bola") * 0.12;
  score += c(counts, "Participação em jogada de gol") * 0.2;
  score -= c(counts, "Perda de bola") * 0.09;
  score -= c(counts, "Erro de domínio") * 0.07;
  score -= c(counts, "Erro defensivo") * 0.3;
  score -= c(counts, "Gol sofrido por falha individual") * 0.8;
  score -= c(counts, "Falta cometida") * 0.06;
  score -= c(counts, "Cartão amarelo") * 0.4;
  score -= c(counts, "Cartão vermelho") * 1.5;
  score = 6 + (score - 6) / load;
  return Number(Math.max(0, Math.min(10, score)).toFixed(1));
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export interface RadarSkills extends Record<string, number> {
  Passe: number;
  Finalização: number;
  Defesa: number;
  "Tomada de decisão": number;
  Disciplina: number;
  Intensidade: number;
  Velocidade: number;
  Resistência: number;
}

export function radarSkills(
  counts: Counts,
  physical: PhysicalData[],
  athlete: Athlete,
  matches: number,
): RadarSkills {
  const games = Math.max(matches, 1);
  const phys = aggregatePhysical(physical);
  return {
    Passe: clamp(passAccuracy(counts)),
    Finalização: clamp(shotEfficiency(counts) * 1.6 + (c(counts, "Gol") / games) * 18),
    Defesa: clamp((tackles(counts) / games) * 9 + (c(counts, "Bloqueio") / games) * 6),
    "Tomada de decisão": clamp(
      70 + (c(counts, "Assistência") / games) * 10 - (c(counts, "Perda de bola") / games) * 5,
    ),
    Disciplina: clamp(
      100 - (c(counts, "Falta cometida") / games) * 9 - c(counts, "Cartão amarelo") * 12,
    ),
    Intensidade: clamp((phys.sprints / games) * 4 + (phys.highIntensityMin / games) * 3),
    Velocidade: clamp(((phys.maxSpeed || athlete.maxSpeed) / 30) * 100),
    Resistência: clamp((phys.distance / games / 4500) * 100),
  };
}

export function aggregatePhysical(rows: PhysicalData[]) {
  if (rows.length === 0)
    return {
      distance: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      avgHr: 0,
      maxHr: 0,
      sprints: 0,
      highIntensityMin: 0,
      moderateIntensityMin: 0,
      lowIntensityMin: 0,
      calories: 0,
    };
  const sum = (k: keyof PhysicalData) => rows.reduce((t, r) => t + (r[k] as number), 0);
  return {
    distance: sum("distance"),
    avgSpeed: Number((sum("avgSpeed") / rows.length).toFixed(1)),
    maxSpeed: Math.max(...rows.map((r) => r.maxSpeed)),
    avgHr: Math.round(sum("avgHr") / rows.length),
    maxHr: Math.max(...rows.map((r) => r.maxHr)),
    sprints: sum("sprints"),
    highIntensityMin: Number(sum("highIntensityMin").toFixed(1)),
    moderateIntensityMin: Number(sum("moderateIntensityMin").toFixed(1)),
    lowIntensityMin: Number(sum("lowIntensityMin").toFixed(1)),
    calories: sum("calories"),
  };
}

export interface AthleteSummary {
  athlete: Athlete;
  counts: Counts;
  matches: number;
  minutes: number;
  grade: number;
  passAccuracy: number;
  shotEfficiency: number;
  tackles: number;
  radar: RadarSkills;
  physical: ReturnType<typeof aggregatePhysical>;
  gradeHistory: { label: string; nota: number; passes: number; intensidade: number }[];
  trend: "up" | "down" | "flat";
}

export function athleteSummary(db: DB, athleteId: string, lastN = 99): AthleteSummary {
  const athlete = db.athletes.find((a) => a.id === athleteId)!;
  const played = db.matches
    .filter((m) => m.status === "finalizada")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-lastN);
  const ids = played.map((m) => m.id);
  const events = db.events.filter((e) => e.athleteId === athleteId && ids.includes(e.matchId));
  const physRows = db.physical.filter((p) => p.athleteId === athleteId && ids.includes(p.matchId));
  const mps = db.matchPlayers.filter((p) => p.athleteId === athleteId && ids.includes(p.matchId));
  const counts = countEvents(events);
  const minutes = mps.reduce((t, m) => t + m.minutesPlayed, 0);

  const gradeHistory = played.map((m) => {
    const mEvents = events.filter((e) => e.matchId === m.id);
    const mCounts = countEvents(mEvents);
    const min = mps.find((p) => p.matchId === m.id)?.minutesPlayed ?? 0;
    const ph = physRows.find((p) => p.matchId === m.id);
    return {
      label: m.opponent.split(" ")[0] ?? m.opponent,
      nota: matchGrade(mCounts, min),
      passes: passAccuracy(mCounts),
      intensidade: ph ? ph.sprints : 0,
    };
  });

  const first = gradeHistory[0]?.passes ?? 0;
  const last = gradeHistory[gradeHistory.length - 1]?.passes ?? 0;
  const trend = last - first > 3 ? "up" : first - last > 3 ? "down" : "flat";

  return {
    athlete,
    counts,
    matches: played.length,
    minutes,
    grade: Number(
      (gradeHistory.reduce((t, g) => t + g.nota, 0) / Math.max(gradeHistory.length, 1)).toFixed(1),
    ),
    passAccuracy: passAccuracy(counts),
    shotEfficiency: shotEfficiency(counts),
    tackles: tackles(counts),
    radar: radarSkills(counts, physRows, athlete, played.length),
    physical: aggregatePhysical(physRows),
    gradeHistory,
    trend,
  };
}

export interface Diagnosis {
  strengths: string[];
  improvements: string[];
}

export function diagnose(s: AthleteSummary): Diagnosis {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const games = Math.max(s.matches, 1);

  if (s.passAccuracy >= 80) strengths.push(`Precisão de passe consistente (${s.passAccuracy}%)`);
  else if (s.passAccuracy < 75)
    improvements.push(`Precisão de passes abaixo da média (${s.passAccuracy}%)`);

  if (s.tackles / games >= 6) strengths.push("Boa capacidade de desarme e pressão");
  else if (s.tackles / games < 3.5) improvements.push("Baixa quantidade de desarmes por partida");

  if (s.shotEfficiency >= 30) strengths.push(`Alta eficiência nas finalizações (${s.shotEfficiency}%)`);
  else if (shots(s.counts) > 0 && s.shotEfficiency < 20)
    improvements.push(`Baixa eficiência nas finalizações (${s.shotEfficiency}%)`);

  if (s.radar.Intensidade >= 70) strengths.push("Alta intensidade física durante o jogo");
  else if (s.radar.Intensidade < 45) improvements.push("Volume de sprints e alta intensidade baixos");

  if (c(s.counts, "Recuperação de bola") / games >= 2)
    strengths.push("Boa recuperação de bola no meio de quadra");
  if (c(s.counts, "Perda de bola") / games > 3.5)
    improvements.push("Perdas de bola acima do aceitável por partida");
  if (s.radar.Disciplina < 70) improvements.push("Indisciplina: faltas e cartões acima da média");
  if (s.radar.Resistência >= 70) strengths.push("Excelente volume de deslocamento (resistência)");

  if (strengths.length === 0) strengths.push("Perfil equilibrado, sem picos negativos relevantes");
  if (improvements.length === 0) improvements.push("Manter evolução: refinar decisão em transições");
  return { strengths, improvements };
}

export interface Recommendation {
  problem: string;
  recommendation: string;
  exercises: string[];
}

export function recommendations(s: AthleteSummary): Recommendation[] {
  const out: Recommendation[] = [];
  const games = Math.max(s.matches, 1);
  const errorRate = 100 - s.passAccuracy;

  if (errorRate > 25)
    out.push({
      problem: `Passe errado acima de 25% (${errorRate}%)`,
      recommendation: "Treinamento de passe curto sob pressão",
      exercises: [
        "Rondos 3x1",
        "Passe em espaço reduzido",
        "Passe de primeira",
        "Tomada de decisão em superioridade numérica",
      ],
    });
  if (shots(s.counts) > 0 && s.shotEfficiency < 22)
    out.push({
      problem: `Baixa eficiência nas finalizações (${s.shotEfficiency}%)`,
      recommendation: "Treinamento específico de finalização",
      exercises: [
        "Finalização após domínio",
        "Finalização de primeira",
        "Chute após deslocamento lateral",
        "Finalização sob pressão",
      ],
    });
  if (s.tackles / games < 3.5)
    out.push({
      problem: "Baixa quantidade de desarmes",
      recommendation: "Treinamento defensivo",
      exercises: ["1x1 defensivo", "Cobertura", "Antecipação", "Pressão sobre portador da bola"],
    });
  if (s.radar.Intensidade < 50)
    out.push({
      problem: "Intensidade física abaixo do padrão da equipe",
      recommendation: "Treinamento intermitente de alta intensidade",
      exercises: [
        "Tiros de 15s com pausa de 15s",
        "Circuito com bola em máxima intensidade",
        "Sprints repetidos com mudança de direção",
        "Jogo 3x3 em espaço curto",
      ],
    });
  if (c(s.counts, "Perda de bola") / games > 3.5)
    out.push({
      problem: "Perdas de bola acima da média",
      recommendation: "Treinamento de proteção e controle de bola",
      exercises: ["Domínio orientado", "Condução sob pressão", "Saída de marcação", "Jogo 1x1 com apoio"],
    });
  if (s.radar.Disciplina < 70)
    out.push({
      problem: "Faltas e cartões acima da média",
      recommendation: "Treinamento de timing defensivo",
      exercises: ["Marcação sem contato", "Posicionamento defensivo", "Leitura de passe", "Contenção paciente"],
    });
  return out;
}

export interface DevPlan {
  objective: string;
  indicator: string;
  current: number;
  target: number;
  unit: string;
  deadlineDays: number;
  sessions: string;
  progress: number;
}

export function developmentPlan(s: AthleteSummary): DevPlan[] {
  const plans: DevPlan[] = [];
  const games = Math.max(s.matches, 1);
  if (s.passAccuracy < 85)
    plans.push({
      objective: "Melhorar precisão de passe",
      indicator: "Precisão de passes",
      current: s.passAccuracy,
      target: Math.min(90, s.passAccuracy + 10),
      unit: "%",
      deadlineDays: 30,
      sessions: "2 sessões semanais de passe sob pressão",
      progress: Math.round((s.passAccuracy / Math.min(90, s.passAccuracy + 10)) * 100),
    });
  if (s.shotEfficiency < 32)
    plans.push({
      objective: "Aumentar eficiência de finalização",
      indicator: "Gols por finalização",
      current: s.shotEfficiency,
      target: 32,
      unit: "%",
      deadlineDays: 45,
      sessions: "2 sessões semanais de finalização com fadiga controlada",
      progress: Math.round((s.shotEfficiency / 32) * 100),
    });
  if (s.tackles / games < 6)
    plans.push({
      objective: "Elevar ações defensivas por partida",
      indicator: "Desarmes + interceptações",
      current: Number((s.tackles / games).toFixed(1)),
      target: 6,
      unit: "/jogo",
      deadlineDays: 30,
      sessions: "1 sessão semanal de duelos defensivos",
      progress: Math.round((s.tackles / games / 6) * 100),
    });
  if (s.radar.Intensidade < 65)
    plans.push({
      objective: "Aumentar volume de alta intensidade",
      indicator: "Sprints por partida",
      current: Number((s.physical.sprints / games).toFixed(1)),
      target: 22,
      unit: "sprints",
      deadlineDays: 60,
      sessions: "2 sessões semanais de treino intermitente",
      progress: Math.round((s.physical.sprints / games / 22) * 100),
    });
  return plans;
}

export function teamInsights(db: DB, teamId: string): { athlete: string; text: string; tone: "positive" | "negative" | "neutral" }[] {
  const out: { athlete: string; text: string; tone: "positive" | "negative" | "neutral" }[] = [];
  const athletes = db.athletes.filter((a) => a.teamId === teamId);
  const summaries = athletes.map((a) => athleteSummary(db, a.id));
  const avgDistance =
    summaries.reduce((t, s) => t + s.physical.distance / Math.max(s.matches, 1), 0) /
    Math.max(summaries.length, 1);

  summaries.forEach((s) => {
    const h = s.gradeHistory;
    if (h.length >= 4) {
      const recent = h.slice(-4);
      const rising = recent.every((g, i) => i === 0 || g.passes >= (recent[i - 1]?.passes ?? 0) - 1);
      const firstP = recent[0]?.passes ?? 0;
      const lastP = recent[3]?.passes ?? 0;
      if (rising && lastP - firstP > 4)
        out.push({
          athlete: s.athlete.name,
          tone: "positive",
          text: `${s.athlete.name} apresenta evolução consistente nos passes nas últimas quatro partidas (${firstP}% → ${lastP}%).`,
        });
    }
    const secondHalfEvents = db.events.filter((e) => e.athleteId === s.athlete.id && e.period === 2).length;
    const firstHalfEvents = db.events.filter((e) => e.athleteId === s.athlete.id && e.period === 1).length;
    if (firstHalfEvents > 0 && secondHalfEvents < firstHalfEvents * 0.78)
      out.push({
        athlete: s.athlete.name,
        tone: "negative",
        text: `${s.athlete.name} apresenta queda de intensidade física no segundo tempo (${Math.round((1 - secondHalfEvents / firstHalfEvents) * 100)}% menos ações).`,
      });
    if (c(s.counts, "Recuperação de bola") >= 6 && s.passAccuracy < 78)
      out.push({
        athlete: s.athlete.name,
        tone: "neutral",
        text: `${s.athlete.name} possui alto índice de recuperação de bola, mas baixa precisão no primeiro passe após o desarme (${s.passAccuracy}%).`,
      });
    const perMatch = s.physical.distance / Math.max(s.matches, 1);
    if (perMatch > avgDistance * 1.08)
      out.push({
        athlete: s.athlete.name,
        tone: "positive",
        text: `${s.athlete.name} percorre distância acima da média da equipe (${Math.round(perMatch)}m vs ${Math.round(avgDistance)}m), porém apresenta queda de velocidade no final do jogo.`,
      });
  });
  return out.slice(0, 12);
}

export function teamMatchStats(db: DB, matchId: string) {
  const events = db.events.filter((e) => e.matchId === matchId);
  const counts = countEvents(events);
  return {
    counts,
    passesOk: c(counts, "Passe certo"),
    passesBad: c(counts, "Passe errado"),
    passAccuracy: passAccuracy(counts),
    shots: shots(counts),
    shotsOn: c(counts, "Chute a gol"),
    goals: c(counts, "Gol"),
    assists: c(counts, "Assistência"),
    tackles: c(counts, "Desarme"),
    interceptions: c(counts, "Interceptação"),
    losses: c(counts, "Perda de bola"),
    fouls: c(counts, "Falta cometida"),
    yellow: c(counts, "Cartão amarelo"),
    red: c(counts, "Cartão vermelho"),
    events,
  };
}

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function age(birthDate: string) {
  const d = new Date(birthDate);
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}
