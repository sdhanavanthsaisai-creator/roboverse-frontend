export type Member = {
  id: number;
  name: string;
  role: string;
  photo: string;
  instagram: string;
  github?: string;
  linkedin?: string;
  email?: string;
  bio: string;
};

/**
 * Seed for the 5 team members. Same shape as the Supabase `members` table
 * (see supabase/schema.sql) — with env vars configured the app reads from
 * Supabase instead, so teammates can edit their own entries there.
 */
export const seedMembers: Member[] = [
  {
    id: 1,
    name: 'M. Swastii',
    role: '1st Year ECE · Cyber Physical Systems',
    photo: 'photos/member1.jpg',
    instagram: 'https://instagram.com/mswastii_75',
    linkedin: 'https://www.linkedin.com/in/m-swastii-murugesan-00717a429',
    bio: '1st year ECE — Cyber Physical Systems team member.',
  },
  {
    id: 2,
    name: 'Ishani Garg',
    role: 'Member · Team Roboto',
    photo: 'photos/member2.jpg',
    instagram: 'https://instagram.com/stfuishani_',
    linkedin: 'https://www.linkedin.com/in/ishani-garg-b1a339425',
    email: 'ishanigarg2@gmail.com',
    bio: 'Reports, slide deck, and keeping the crew on schedule.',
  },
  {
    id: 3,
    name: 'Dhanavanthsai',
    role: 'Web & Documentation',
    photo: 'photos/member3.jpg',
    instagram: 'https://instagram.com/dhanavanth_17',
    linkedin: 'https://www.linkedin.com/in/dhanavanth-sai-16a272414',
    email: 'dhanavanthsai.s@gmail.com',
    bio: 'This website and the project documentation.',
  },
  {
    id: 4,
    name: 'Muhammed Nehan',
    role: 'Electronics & Computer Engineering (EKE)',
    photo: 'photos/member4.jpg',
    instagram: 'https://instagram.com/nvm.nehan',
    github: 'https://github.com/K1llaloe',
    linkedin: 'https://www.linkedin.com/in/muhammed-nehan-472694368',
    email: 'ciphertrooper@gmail.com',
    bio: 'Electronics and computer engineering, class of 2030.',
  },
  {
    id: 5,
    name: 'Nipun Gaur',
    role: '1st Year B.Tech CSE (IT)',
    photo: 'photos/member5.jpg',
    instagram: 'https://instagram.com/nipun2908',
    linkedin: 'https://www.linkedin.com/in/nipun-gaur-b42408429',
    email: 'nipungaur2008@gmail.com',
    bio: '1st year B.Tech CSE (IT) team member.',
  },
];
