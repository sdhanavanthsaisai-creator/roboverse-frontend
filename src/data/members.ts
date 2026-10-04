export type Member = {
  id: number;
  name: string;
  role: string;
  photo: string;
  instagram: string;
  github: string;
  email: string;
  bio: string;
};

/**
 * Seed for the 8 team members. Same shape as the Supabase `members` table
 * (see supabase/schema.sql) — with env vars configured the app reads from
 * Supabase instead, so teammates can edit their own entries there.
 * Drop real photos in public/photos/member1.jpg … member8.jpg.
 */
export const seedMembers: Member[] = [
  {
    id: 1,
    name: 'Member One',
    role: 'Team Lead · Navigation',
    photo: 'photos/member1.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member1@teamroboto.dev',
    bio: 'Owns the planner stack and the daily commit streak.',
  },
  {
    id: 2,
    name: 'Member Two',
    role: 'Sensor Fusion',
    photo: 'photos/member2.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member2@teamroboto.dev',
    bio: 'Kalman filters, ultrasonic rigs, and noisy data.',
  },
  {
    id: 3,
    name: 'Member Three',
    role: 'Embedded Systems',
    photo: 'photos/member3.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member3@teamroboto.dev',
    bio: 'Firmware, motor drivers, and the 5 kg weight budget.',
  },
  {
    id: 4,
    name: 'Member Four',
    role: 'CAD & Mechanical',
    photo: 'photos/member4.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member4@teamroboto.dev',
    bio: 'Chassis, mounts, and printable sensor brackets.',
  },
  {
    id: 5,
    name: 'Member Five',
    role: 'Computer Vision',
    photo: 'photos/member5.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member5@teamroboto.dev',
    bio: 'Detecting walls, exits, and things that moved.',
  },
  {
    id: 6,
    name: 'Member Six',
    role: 'Reinforcement Learning',
    photo: 'photos/member6.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member6@teamroboto.dev',
    bio: 'Q-learning so attempt 50 beats attempt 1.',
  },
  {
    id: 7,
    name: 'Member Seven',
    role: 'Power & Electronics',
    photo: 'photos/member7.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member7@teamroboto.dev',
    bio: 'Battery, PCB, and keeping the magic smoke inside.',
  },
  {
    id: 8,
    name: 'Member Eight',
    role: 'Web & Documentation',
    photo: 'photos/member8.jpg',
    instagram: 'https://instagram.com/',
    github: 'https://github.com/',
    email: 'member8@teamroboto.dev',
    bio: 'This website, the reports, and the slide deck.',
  },
];
