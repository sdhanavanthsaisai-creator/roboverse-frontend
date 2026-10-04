export type CodeSnippet = {
  id: number;
  module: string;
  language: string;
  /** null source = teammate submission still pending */
  source: string | null;
};

/**
 * Local stand-ins for the `code_snippets` table. Source is null for every
 * module right now — the Code Vault renders those as SOURCE PENDING until the
 * team pushes real code (via Supabase or by editing this file).
 */
export const seedSnippets: CodeSnippet[] = [
  { id: 1, module: 'pathfinding.py', language: 'Python', source: null },
  { id: 2, module: 'sensor_fusion.py', language: 'Python', source: null },
  { id: 3, module: 'q_learning.py', language: 'Python', source: null },
  { id: 4, module: 'maze_mapper.py', language: 'Python', source: null },
  { id: 5, module: 'motor_control.ino', language: 'C++', source: null },
  { id: 6, module: 'ultrasonic_rig.ino', language: 'C++', source: null },
];
