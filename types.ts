export type UserType = {
    id: string;
    username: string;
    name: string;
    email: string;
    password?: string; // Password is optional as we don't always need to expose it
    avatar_url?: string | null;
    streak_day: number;
  };
  
  export type WritingType = {
    id: string;
    user_id: string;
    title: string;
    content: any; // Tiptap JSON content
    is_published: boolean;
    created_at: Date;
    updated_at: Date;
    ai_chat_history: { role: string; content: string }[];
  };