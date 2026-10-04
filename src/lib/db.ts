import { supabase, isSupabaseConfigured } from './supabase';
import { seedMembers, type Member } from '../data/members';
import { seedSnippets, type CodeSnippet } from '../data/snippets';

export type MazeAttempt = {
  id?: number;
  path_cost: number;
  attempts: number;
  duration_ms: number;
};

export type Message = {
  id?: number;
  name: string;
  body: string;
  created_at?: string;
};

export type Stats = {
  attempts: number;
  best_cost: number;
  best_time: number;
  messages: number;
};

const emptyStats: Stats = { attempts: 0, best_cost: 0, best_time: 0, messages: 0 };

/**
 * Data access layer. Every reader tries Supabase first and falls back to the
 * local seed so the site runs (and builds) before credentials exist.
 */
export async function getMembers(): Promise<Member[]> {
  if (!supabase) return seedMembers;
  const { data, error } = await supabase.from('members').select('*').order('id');
  if (error || !data || data.length === 0) return seedMembers;
  return data as Member[];
}

export async function getSnippets(): Promise<CodeSnippet[]> {
  if (!supabase) return seedSnippets;
  const { data, error } = await supabase.from('code_snippets').select('*').order('id');
  if (error || !data || data.length === 0) return seedSnippets;
  return data as CodeSnippet[];
}

export async function getStats(): Promise<Stats> {
  if (!supabase) return emptyStats;
  const [attempts, messages] = await Promise.all([
    supabase.from('maze_attempts').select('path_cost,duration_ms'),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
  ]);
  if (attempts.error) return emptyStats;
  const rows = (attempts.data ?? []) as { path_cost: number; duration_ms: number }[];
  if (rows.length === 0) return { ...emptyStats, messages: messages.count ?? 0 };
  return {
    attempts: rows.length,
    best_cost: Math.min(...rows.map((r) => r.path_cost)),
    best_time: Math.min(...rows.map((r) => r.duration_ms)),
    messages: messages.count ?? 0,
  };
}

export async function insertAttempt(row: MazeAttempt): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('maze_attempts').insert(row);
  return !error;
}

export async function insertMessage(msg: Omit<Message, 'id' | 'created_at'>): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('messages').insert(msg);
  return !error;
}

export { isSupabaseConfigured };
