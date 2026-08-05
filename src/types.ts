export interface Publication {
  id: string;
  category: 'INTELLIGENCE' | 'ETHICS' | 'DESIGN' | 'ROBOTICS';
  title: string;
  authors: string;
  publishedIn: string;
  year: number;
  abstract: string;
  keyFindings: string[];
  citation: string;
  imageUrl?: string;
}

export interface FocusArea {
  id: string;
  title: string;
  type: 'CORE THEME' | 'NEW INITIATIVE';
  description: string;
  iconName: 'robot' | 'brain' | 'shield' | 'eye';
  imageUrl?: string;
  bgClass: string;
  textClass: string;
  detailedDescription: string;
  projects: string[];
  leadResearcher: string;
}

export interface SocialLinks {
  email?: string;
  linkedin?: string;
  scholar?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  bio?: string;
  expertise?: string;
  imageUrl: string;
  socials?: SocialLinks;
}

export interface StudentResearcher {
  name: string;
  role: string;
  topic?: string;
  socials?: SocialLinks;
}

export interface Alumni {
  name: string;
  role: string;
  period?: string;
  currentPosition?: string;
  socials?: SocialLinks;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
