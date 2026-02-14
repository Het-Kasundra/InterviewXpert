
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string | null;
          xp: number;
          badges: any[];
          notification_email: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          xp?: number;
          badges?: any[];
          notification_email?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          xp?: number;
          badges?: any[];
          notification_email?: boolean;
          created_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          role: string | null;
          company: string | null;
          skills: string[];
          mode: 'voice' | 'video' | 'text';
          difficulty: 'easy' | 'medium' | 'hard';
          scheduled_at: string | null;
          started_at: string | null;
          ended_at: string | null;
          overall_score: number | null;
          transcript: any | null;
          media_urls: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: string | null;
          company?: string | null;
          skills?: string[];
          mode: 'voice' | 'video' | 'text';
          difficulty: 'easy' | 'medium' | 'hard';
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          overall_score?: number | null;
          transcript?: any | null;
          media_urls?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string | null;
          company?: string | null;
          skills?: string[];
          mode?: 'voice' | 'video' | 'text';
          difficulty?: 'easy' | 'medium' | 'hard';
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          overall_score?: number | null;
          transcript?: any | null;
          media_urls?: any | null;
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          interview_id: string;
          question_no: number;
          question: string;
          rubric: any | null;
          tips: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          question_no: number;
          question: string;
          rubric?: any | null;
          tips?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          question_no?: number;
          question?: string;
          rubric?: any | null;
          tips?: string[];
          created_at?: string;
        };
      };
    };
  };
};
