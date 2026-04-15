const PLANS: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  vid: string | null;
  popular: boolean;
}[] = [
  {
    name: "Free",
    price: "0",
    period: "",
    description: "Try it out",
    features: [
      "3 AI scans per day",
      "3 humanizations per day",
      "3 rewrites per day",
      "Up to 3,000 words per input",
      "Basic AI detection",
    ],
    vid: null,
    popular: false,
  },
  {
    name: "Basic",
    price: "9.99",
    period: "/mo",
    description: "For casual users",
    features: [
      "10 AI scans per day",
      "30 humanizations per day",
      "30 rewrites per day",
      "Up to 8,000 words per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "Tone & perspective controls",
    ],
    vid: "1524022",
    popular: false,
  },
  {
    name: "Pro",
    price: "19.99",
    period: "/mo",
    description: "For students & writers",
    features: [
      "50 AI scans per day",
      "100 humanizations per day",
      "100 rewrites per day",
      "Up to 15,000 words per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "One-click sentence rewrite",
      "Tone & perspective controls",
    ],
    vid: "1524636",
    popular: true,
  },
  {
    name: "Max",
    price: "39.99",
    period: "/mo",
    description: "For power users & teams",
    features: [
      "300 AI scans per day",
      "Unlimited humanizations",
      "Unlimited rewrites",
      "Up to 30,000 words per input",
      "File upload (PDF, DOCX, TXT)",
      "Sentence-level AI highlights",
      "One-click sentence rewrite",
      "Tone & perspective controls",
      "Priority processing (2× faster)",
      "Early access to new features",
    ],
    vid: "1524640",
    popular: false,
  },
];

export default PLANS;
