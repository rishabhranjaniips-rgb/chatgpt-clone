export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachment?: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}
