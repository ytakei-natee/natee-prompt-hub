export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
};

export type Prompt = {
  id: string;
  author_id: string | null;
  role: string;
  task: string;
  title: string;
  role_setting: string;
  background: string;
  task_description: string;
  constraints: string;
  output_format: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // joined
  author?: Profile;
};

export type Like = {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  prompt_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  // joined
  author?: Profile;
};

export type GridCount = {
  role: string;
  task: string;
  count: number;
};
