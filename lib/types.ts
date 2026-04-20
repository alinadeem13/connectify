export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  owner: string;
  username: string;
  caption: string;
  location: string;
  people: string[];
  comments: Comment[];
  image: string;
  createdAt: string;
  averageRating?: number;
  ratingCount?: number;
};

export type UserRole = "creator" | "consumer";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
};

export type Session = {
  token: string;
  userId: string;
  createdAt: string;
};
