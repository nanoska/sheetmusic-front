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
  theme_title?: string;
  title: string;
  type: 'STANDARD' | 'ENSAMBLE' | 'DUETO' | 'GRUPO_REDUCIDO';
  type_display?: string;
  image?: string;
  audio_file?: string;
  mus_file?: string;
  notes: string;
  sheet_music_count?: number;
  created_at: string;
  updated_at: string;
  sheet_music?: SheetMusic[];
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

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RepertoireVersion {
  id: number;
  repertoire: number;
  version: number;
  version_title?: string;
  version_artist?: string;
  version_type?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Repertoire {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  versions: RepertoireVersion[];
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  location: number | Location;
  location_details?: {
    name: string;
    address: string;
    city: string;
  };
  repertoire?: number | Repertoire;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  is_public: boolean;
  max_attendees?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}