const PLANS: {
  name: string;
  price: string;
  period: string;
  perDay: string;
  description: string;
  features: string[];
  vid: string | null;
  popular: boolean;
}[] = [
  {
    name: "Free",
    price: "0",
    period: "",
    perDay: "",
    description: "Try it out — no credit card needed",
    features: [
      "3 AI scans per day",
      "3 humanizations per day",
      "3 rewrites per day",
      "Up to 1,000 characters per input",
      "Basic AI detection",
    ],
    vid: null,
    popular: false,
  },
  {
    name: "Basic",
    price: "9.99",
    period: "/mo",
    perDay: "$0.32/day",
    description: "For casual users",
    features: [
      "10 AI scans per day",
      "30 humanizations per day",
      "30 rewrites per day",
      "Up to 8,000 characters per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "Tone & perspective controls",
    ],
    vid: "1553040",
    popular: false,
  },
  {
    name: "Pro",
    price: "19.99",
    period: "/mo",
    perDay: "$0.65/day",
    description: "For students & writers",
    features: [
      "50 AI scans per day",
      "100 humanizations per day",
      "100 rewrites per day",
      "Up to 15,000 characters per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "One-click sentence rewrite",
      "Tone & perspective controls",
    ],
    vid: "1553066",
    popular: true,
  },
  {
    name: "Max",
    price: "39.99",
    period: "/mo",
    perDay: "$1.29/day",
    description: "For power users & teams",
    features: [
      "300 AI scans per day",
      "Unlimited humanizations",
      "Unlimited rewrites",
      "Up to 30,000 characters per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "One-click sentence rewrite",
      "Tone & perspective controls",
      "Priority processing (2× faster)",
      "Early access to new features",
    ],
    vid: "1553067",
    popular: false,
  },
];

export const DAILY_PASSES: {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  vid: string;
  popular: boolean;
}[] = [
  {
    name: "1-Day Pass",
    price: "5.99",
    duration: "24 hours",
    description: "Full Pro access, no commitment",
    features: [
      "50 AI scans",
      "100 humanizations",
      "100 rewrites",
      "Up to 15,000 characters per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "One-click sentence rewrite",
      "Tone & perspective controls",
    ],
    vid: "1553092",
    popular: false,
  },
  {
    name: "3-Day Pass",
    price: "12.99",
    duration: "72 hours",
    description: "Best value for short projects",
    features: [
      "50 AI scans / day",
      "100 humanizations / day",
      "100 rewrites / day",
      "Up to 15,000 characters per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "One-click sentence rewrite",
      "Tone & perspective controls",
    ],
    vid: "1553096",
    popular: true,
  },
];

export default PLANS;
