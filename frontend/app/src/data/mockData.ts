import { User, Community, Thread, Notification, ModerationAction } from "../types";

export const MOCK_USER: User = {
  id: "u1",
  codename: "Archon_93",
  title: "Signal Interceptor",
  avatar: "https://picsum.photos/seed/archon/200/200",
  clearance: "Level 4 (High)",
  stats: {
    truthScore: 1420,
    credits: 840,
    anomalies: 12
  },
  manifesto: "Observation is the first step toward containment. We see what they hide."
};

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "c1",
    name: "Deep State",
    description: "Tracking the unacknowledged layers of global governance and the protocols of the unseen ruling class.",
    category: "Deep State",
    members: 14200,
    activeNodes: 842,
    icon: "ShieldAlert",
    heroImage: "https://picsum.photos/seed/deepstate/1200/600",
    rules: ["Absolute confidentiality", "Verified sources only", "No state actors"],
    moderators: ["Oracle_0", "Specter_V"]
  },
  {
    id: "c2",
    name: "Techno Myth",
    description: "Where Silicon Valley meets elder gods. Investigating sentient algorithms and spectral hardware.",
    category: "Techno Myth",
    members: 8900,
    activeNodes: 312,
    icon: "Cpu",
    heroImage: "https://picsum.photos/seed/techno/1200/600",
    rules: ["Post code signatures", "Respect the machine", "Digital logic only"],
    moderators: ["Hex_Driver", "Null_Pointer"]
  },
  {
    id: "c3",
    name: "Hidden History",
    description: "Rewriting the chronological lies fed to the masses. Artifacts that shouldn't exist.",
    category: "Hidden History",
    members: 22100,
    activeNodes: 1104,
    icon: "Library",
    heroImage: "https://picsum.photos/seed/history/1200/600",
    rules: ["Cite forbidden texts", "Physical evidence preferred", "No revisionist slop"],
    moderators: ["Librarian_X", "Ancient_One"]
  },
  {
    id: "c4",
    name: "Outer World",
    description: "Extraterrestrial, extra-dimensional, and extra-narrative. We are not alone, but we are ignored.",
    category: "Outer World",
    members: 35000,
    activeNodes: 4500,
    icon: "Ghost",
    heroImage: "https://picsum.photos/seed/outer/1200/600",
    rules: ["Telemetry data required", "No swamp gas theories", "Watch the skies"],
    moderators: ["Void_Walker", "Star_Child"]
  }
];

export const MOCK_THREADS: Thread[] = [
  {
    id: "t1",
    authorId: "u1",
    authorName: "Archon_93",
    communityId: "c1",
    communityName: "Deep State",
    title: "The Antarctica Signal: Decoded after 40 years",
    content: "I've been monitoring the ELF frequencies coming from the McMurdo Station perimeter. Since the solar flare last Tuesday, the signal transitioned from noise to a rhythmic data burst. I managed to run it through a legacy 1980s decryption algorithm. The results are... unsettling. They aren't talking to us. They're talking to something underneath.",
    votes: 1420,
    comments: 128,
    timestamp: "4h ago",
    isAnonymous: false,
    status: "Encrypted"
  },
  {
    id: "t2",
    authorId: "u2",
    authorName: "Anon-77",
    communityId: "c2",
    communityName: "Techno Myth",
    title: "The Black Sea anomalies are synchronized with solar flares",
    content: "Every time our local star burps, the server farm in Istanbul goes dark for exactly 14ms. Checked the cable routes—there is a branch that doesn't belong to any commercial entity. It leads straight into the anomaly zone. I think the AI is getting its power from the sun, but not via panels.",
    votes: 890,
    comments: 42,
    timestamp: "12h ago",
    isAnonymous: true,
    status: "Restricted"
  },
  {
    id: "t3",
    authorId: "u3",
    authorName: "RelicHunter",
    communityId: "c3",
    communityName: "Hidden History",
    title: "Why are they digitizing the 1890 census data for the fourth time?",
    content: "Compare the 2004 scan with the 2024 one. Names are missing. Entire families in the Midwest have been wiped from the digital record. I have the microfilms. There's a bloodline they are trying to erase from existence.",
    votes: 2100,
    comments: 256,
    timestamp: "1d ago",
    isAnonymous: false,
    status: "Public"
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "reply",
    title: "New Transmission",
    message: "Oracle_0 replied to your theory on Antarctica Signals.",
    timestamp: "5m ago",
    read: false,
    link: "/thread/t1"
  },
  {
    id: "n2",
    type: "system",
    title: "Security Clearance",
    message: "Your clearance has been upgraded to Level 4.",
    timestamp: "1h ago",
    read: true
  },
  {
    id: "n3",
    type: "moderation",
    title: "Node Flagged",
    message: "A transmission you flagged has been removed for noise contamination.",
    timestamp: "4h ago",
    read: false
  }
];

export const MOCK_MODERATION: ModerationAction[] = [
  {
    id: "m1",
    targetId: "t4",
    type: "thread",
    reason: "Off-topic / Spam",
    status: "pending",
    timestamp: "10m ago",
    reportedBy: "Archon_93"
  },
  {
    id: "m2",
    targetId: "c12",
    type: "comment",
    reason: "Identity Leak Attempt",
    status: "pending",
    timestamp: "2h ago",
    reportedBy: "Specter_V"
  }
];
