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
 * Seed for the 9 team members. Same shape as the Supabase `members` table
 * (see supabase/schema.sql) — with env vars configured the app reads from
 * Supabase instead, so teammates can edit their own entries there.
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
    name: 'M. Swastii',
    role: '1st YEAR ECE · CYBER PHYSICAL SYSTEMS',
    instagram: 'mswastii_75',
    github: 'm-swastii-murugesan-00717a429',
    email: 'm.swastii@gmail.com',
    photo: 'photos/member7.jpg',
    bio: '1st year ECE — Cyber Physical Systems team member.',
  },
  {
    id: 8,
    name: 'Ishani Garg',
    role: 'SENSORS · PERCEPTION & FUSION',
    instagram: 'stfuishani_',
    github: 'ishani-garg-b1a339425',
    email: 'ishanigarg2@gmail.com',
    photo: 'photos/member8.jpg',
    bio: 'This website, the reports, and the slide deck.',
  },
  {
    id: 9,
    name: 'Dhanavanthsai',
    role: 'ODOMETRY · SENSOR FUSION',
    instagram: 'dhanavanth_17',
    github: 'dhanavanth-sai-16a272414',
    email: 'dhanavanthsai.s@gmail.com',
    photo: 'photos/member8.jpg',
    bio: 'Web & Documentation lead.',
  },
];
