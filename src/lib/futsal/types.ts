export type Position = "Goleiro" | "Fixo" | "Ala direita" | "Ala esquerda" | "Pivô";
export const POSITIONS: Position[] = ["Goleiro", "Fixo", "Ala direita", "Ala esquerda", "Pivô"];

export type Foot = "Direito" | "Esquerdo" | "Ambidestro";

export type EventCategory = "Ataque" | "Defesa" | "Disciplina" | "Outros";

export type EventType =
  | "Passe certo"
  | "Passe errado"
  | "Assistência"
  | "Chute a gol"
  | "Chute para fora"
  | "Chute bloqueado"
  | "Gol"
  | "Perda de bola"
  | "Drible certo"
  | "Drible errado"
  | "Desarme"
  | "Interceptação"
  | "Bloqueio"
  | "Recuperação de bola"
  | "Erro defensivo"
  | "Gol sofrido por falha individual"
  | "Falta cometida"
  | "Falta sofrida"
  | "Cartão amarelo"
  | "Cartão vermelho"
  | "Roubo de bola"
  | "Erro de domínio"
  | "Finalização perigosa"
  | "Participação em jogada de gol";

export const EVENT_GROUPS: { category: EventCategory; events: EventType[] }[] = [
  {
    category: "Ataque",
    events: [
      "Passe certo",
      "Passe errado",
      "Assistência",
      "Chute a gol",
      "Chute para fora",
      "Chute bloqueado",
      "Gol",
      "Perda de bola",
      "Drible certo",
      "Drible errado",
    ],
  },
  {
    category: "Defesa",
    events: [
      "Desarme",
      "Interceptação",
      "Bloqueio",
      "Recuperação de bola",
      "Erro defensivo",
      "Gol sofrido por falha individual",
    ],
  },
  {
    category: "Disciplina",
    events: ["Falta cometida", "Falta sofrida", "Cartão amarelo", "Cartão vermelho"],
  },
  {
    category: "Outros",
    events: [
      "Roubo de bola",
      "Erro de domínio",
      "Finalização perigosa",
      "Participação em jogada de gol",
    ],
  },
];

export const QUICK_EVENTS: EventType[] = [
  "Passe certo",
  "Passe errado",
  "Desarme",
  "Perda de bola",
  "Chute a gol",
  "Gol",
  "Falta cometida",
  "Cartão amarelo",
];

export interface Team {
  id: string;
  name: string;
  category: string;
  season: string;
  coach: string;
  assistant: string;
  fitnessCoach: string;
}

export interface Athlete {
  id: string;
  teamId: string;
  name: string;
  photo?: string;
  shirt: number;
  position: Position;
  foot: Foot;
  birthDate: string;
  height: number; // cm
  weight: number; // kg
  avgHr: number;
  maxHr: number;
  maxSpeed: number; // km/h
  avgDistance: number; // metros por partida
}

export type MatchStatus = "agendada" | "ao_vivo" | "finalizada";

export interface Match {
  id: string;
  teamId: string;
  opponent: string;
  date: string;
  time: string;
  competition: string;
  venue: string;
  category: string;
  homeAway: "Casa" | "Fora";
  status: MatchStatus;
  scoreUs: number;
  scoreThem: number;
  period: 1 | 2;
  clockSeconds: number;
  running: boolean;
  teamFouls: { 1: number; 2: number };
}

export interface MatchPlayer {
  matchId: string;
  athleteId: string;
  role: "Titular" | "Reserva" | "Goleiro";
  onCourt: boolean;
  minutesPlayed: number;
  benchMinutes: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  athleteId: string;
  eventType: EventType;
  timestamp: number; // segundos dentro do período
  period: 1 | 2;
  createdAt: number;
}

export interface Substitution {
  id: string;
  matchId: string;
  outId: string;
  inId: string;
  minute: number;
  period: 1 | 2;
}

export interface PhysicalData {
  matchId: string;
  athleteId: string;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  avgHr: number;
  maxHr: number;
  sprints: number;
  highIntensityMin: number;
  moderateIntensityMin: number;
  lowIntensityMin: number;
  calories: number;
  source: string;
}

export const GPS_PROVIDERS = [
  "Manual",
  "Garmin",
  "Polar",
  "Apple Watch",
  "Samsung Galaxy Watch",
  "Catapult",
  "STATSports",
];
