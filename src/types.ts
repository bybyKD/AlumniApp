export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Alumni {
  id: string;
  name: string;
  position: string;
  company: string;
  country: string;
  industry: string;
  education: string;
  skills: string[];
  image: string;
  bio?: string;
  career_highlights?: string[];
  email?: string;
  linkedin?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
