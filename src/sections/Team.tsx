import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionShell from '../components/SectionShell';
import IDCard from '../components/IDCard';
import { getMembers, isSupabaseConfigured } from '../lib/db';
import { seedMembers, type Member } from '../data/members';

export default function Team() {
  const [members, setMembers] = useState<Member[]>(seedMembers);

  useEffect(() => {
    let alive = true;
    getMembers().then((m) => {
      if (alive) setMembers(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SectionShell
      id="team"
      index="05 / CREW"
      title="Team Roboto"
      kicker="Eight members, eight credentials — tap a card to flip it for Instagram, GitHub and email."
    >
      <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
        <span className={isSupabaseConfigured ? 'text-lime' : 'text-mute'}>
          {isSupabaseConfigured ? '● members live from supabase' : '○ seed data — supabase not configured'}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 40, rotateX: -8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.09, ease: [0.16, 1, 0.3, 1] }}
          >
            <IDCard member={member} />
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
