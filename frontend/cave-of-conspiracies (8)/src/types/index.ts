export type User = {
  id: string;
  codename: string;
  title: string;
  avatar: string;
  clearance: string;
  stats: {
    truthScore: number;
    credits: number;
    anomalies: number;
  };
  manifesto?: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  category: "Cryptids" | "Outer World" | "Deep State" | "Techno Myth" | "Folklore" | "Hidden History" | "Anomalies";
  members: number;
  activeNodes: number;
  icon: string;
  heroImage: string;
  rules: string[];
  moderators: string[];
};

export type Thread = {
  id: string;
  authorId: string;
  authorName: string;
  communityId: string;
  communityName: string;
  title: string;
  content: string;
  votes: number;
  comments: number;
  timestamp: string;
  isAnonymous: boolean;
  status?: "Encrypted" | "Restricted" | "Public";
  attachments?: string[];
};

export type Comment = {
  id: string;
  threadId: string;
  authorName: string;
  content: string;
  timestamp: string;
  votes: number;
  isAnonymous: boolean;
  replies?: Comment[];
};

export type Notification = {
  id: string;
  type: "reply" | "mention" | "system" | "moderation";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
};

export type ModerationAction = {
  id: string;
  targetId: string;
  type: "thread" | "comment" | "user";
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  timestamp: string;
  reportedBy: string;
};
