export interface Theme {
  id: number;
  title: string;
  artist: string;
  image?: string;
  tonalidad: string;
  description: string;
  audio?: string;
  created_at: string;
  updated_at: string;
  versions: Version[];
}

export interface Instrument {
  id: number;
  name: string;
  family: 'VIENTO_MADERA' | 'VIENTO_METAL' | 'PERCUSION';
  afinacion: 'Bb' | 'Eb' | 'F' | 'C' | 'G' | 'D' | 'A' | 'E' | 'NONE';
  created_at: string;
}

export interface Version {
  id: number;
  theme: number;
  title: string;
  type: 'STANDARD' | 'ENSAMBLE' | 'DUETO' | 'GRUPO_REDUCIDO';
  image?: string;
  audio_file?: string;
  mus_file?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  sheet_music: SheetMusic[];
}

export interface SheetMusic {
  id: number;
  version: number;
  instrument: number;
  type: 'MELODIA_PRINCIPAL' | 'MELODIA_SECUNDARIA' | 'ARMONIA' | 'BAJO';
  clef: 'SOL' | 'FA';
  tonalidad_relativa: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}