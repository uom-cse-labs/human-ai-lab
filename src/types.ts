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

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: 'DIRECTOR, AIM' | 'LEAD RESEARCHER' | 'PRINCIPAL INVESTIGATOR' | 'SENIOR ADVISOR';
  bio: string;
  expertise: string;
  imageUrl: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  content: string;
  imageUrl: string;
  details: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
