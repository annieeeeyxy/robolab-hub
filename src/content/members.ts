export type Member = {
  slug: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  github?: string;
  email?: string;
  wechatQr?: string;
  website?: string;
  discord?: string;
};

// Add more entries here if others join the project later.
export const MEMBERS: Member[] = [
  {
    slug: "annie-ye",
    name: "Annie Ye",
    role: "Creator & Developer",
    bio: "Building RoboPrompt end to end — product, system prompt design, and the web app.",
    photo: "/annie.png",
    github: "annieeeeyxy",
    email: "anniexye08@gmail.com",
  },
  {
    slug: "dora-ai",
    name: "Dora Ai",
    role: "Team Member",
    bio: "A high school student and a huge gamer who loves combining creativity with technology.",
    photo: "/dora.png",
  },
  {
    slug: "matt-beitler",
    name: "Matt Beitler",
    role: "Team Member",
    website: "https://www.mattbeitler.com/",
  },
  {
    slug: "pearson-wu",
    name: "Pearson Wu",
    role: "Team Member",
    website: "https://pinsong.me/",
  },
  {
    slug: "james-yang",
    name: "James Yang",
    role: "Team Member",
  },
  {
    slug: "bob67",
    name: "bob67",
    role: "Community",
    bio: "Thank you for sharing our project and asking for advice in the FTC Discord!",
    photo: "/bob67.png",
    discord: "bob67987",
  },
];
