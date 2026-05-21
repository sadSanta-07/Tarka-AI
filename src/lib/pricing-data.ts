export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type Plan = {
  id: string;
  name: string;
  pricePerSeat: number;      
  minSeats?: number;        
  maxSeats?: number;         
  features: string[];       
  bestFor: UseCase[];     
};

export type Alternative = {
  toolId: string;
  toolName: string;
  planId: string;
  planName: string;
  pricePerSeat: number;
  bestFor: UseCase[];
  capabilityNote: string;   
};

export type Tool = {
  id: string;
  name: string;
  category: "coding" | "chat" | "api";
  plans: Plan[];
  alternatives: Alternative[]; 
  credexAvailable: boolean;   
  pricingUrl: string;           // for PRICING_DATA.md 
};

// tools 
export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    credexAvailable: true,
    pricingUrl: "https://www.cursor.com/pricing",
    plans: [
      {
        id: "hobby",
        name: "Hobby",
        pricePerSeat: 0,
        features: ["2000 completions/mo", "50 slow premium requests"],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        pricePerSeat: 20,
        features: ["Unlimited completions", "500 fast premium requests/mo", "10 o1 uses/day"],
        bestFor: ["coding"],
      },
      {
        id: "business",
        name: "Business",
        pricePerSeat: 40,
        minSeats: 1,
        features: ["Everything in Pro", "SSO", "Admin dashboard", "Zero data retention"],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeat: 60, 
        minSeats: 20,
        features: ["Everything in Business", "Dedicated support", "Custom contracts"],
        bestFor: ["coding"],
      },
    ],
    alternatives: [
      {
        toolId: "github_copilot",
        toolName: "GitHub Copilot",
        planId: "individual",
        planName: "Individual",
        pricePerSeat: 10,
        bestFor: ["coding"],
        capabilityNote: "Solid autocomplete, weaker multi-file context than Cursor Pro",
      },
      {
        toolId: "windsurf",
        toolName: "Windsurf",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 15,
        bestFor: ["coding"],
        capabilityNote: "Comparable agentic coding to Cursor Pro at 25% less",
      },
    ],
  },

  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "coding",
    credexAvailable: true,
    pricingUrl: "https://github.com/features/copilot#pricing",
    plans: [
      {
        id: "individual",
        name: "Individual",
        pricePerSeat: 10,
        features: ["Code completions", "Chat in IDE", "CLI assistant"],
        bestFor: ["coding"],
      },
      {
        id: "business",
        name: "Business",
        pricePerSeat: 19,
        features: ["Everything Individual", "Policy management", "Audit logs"],
        bestFor: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeat: 39,
        minSeats: 1,
        features: ["Everything Business", "Copilot Workspace", "Fine-tuned models"],
        bestFor: ["coding"],
      },
    ],
    alternatives: [
      {
        toolId: "cursor",
        toolName: "Cursor",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 20,
        bestFor: ["coding"],
        capabilityNote: "Better multi-file context and agentic edits, costs $10 more",
      },
      {
        toolId: "windsurf",
        toolName: "Windsurf",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 15,
        bestFor: ["coding"],
        capabilityNote: "Similar capability to Copilot Business at lower price",
      },
    ],
  },

  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    credexAvailable: true,
    pricingUrl: "https://www.anthropic.com/pricing",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeat: 0,
        features: ["Limited Claude access", "No API"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "pro",
        name: "Pro",
        pricePerSeat: 20,
        features: ["5x more usage than Free", "Priority access", "Projects"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "max",
        name: "Max",
        pricePerSeat: 100, 
        features: ["20x more usage than Pro", "Extended thinking"],
        bestFor: ["research", "data"],
      },
      {
        id: "team",
        name: "Team",
        pricePerSeat: 30,
        minSeats: 2,
        features: ["Everything Pro", "Admin console", "Shared projects", "Higher rate limits"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeat: 60, // floor 
        minSeats: 25,
        features: ["SSO", "Custom retention", "Dedicated support"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "api",
        name: "API Direct",
        pricePerSeat: 0, // pay-per-token — handled separately in audit logic
        features: ["Full API access", "All models"],
        bestFor: ["coding", "data", "research"],
      },
    ],
    alternatives: [
      {
        toolId: "chatgpt",
        toolName: "ChatGPT",
        planId: "plus",
        planName: "Plus",
        pricePerSeat: 20,
        bestFor: ["writing", "research", "mixed"],
        capabilityNote: "Comparable for writing/research; Claude edges out on long context",
      },
      {
        toolId: "gemini",
        toolName: "Gemini",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 20, 
        bestFor: ["writing", "research"],
        capabilityNote: "Comparable general capability, better Google Workspace integration",
      },
    ],
  },

  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    credexAvailable: true,
    pricingUrl: "https://openai.com/chatgpt/pricing",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeat: 0,
        features: ["Limited GPT-4o", "Basic tools"],
        bestFor: ["writing", "mixed"],
      },
      {
        id: "plus",
        name: "Plus",
        pricePerSeat: 20,
        features: ["GPT-4o", "o1", "DALL-E", "Advanced data analysis"],
        bestFor: ["writing", "data", "research", "mixed"],
      },
      {
        id: "team",
        name: "Team",
        pricePerSeat: 30,
        minSeats: 2,
        features: ["Everything Plus", "Admin workspace", "No training on data"],
        bestFor: ["writing", "data", "research", "mixed"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeat: 60, // floor
        minSeats: 25,
        features: ["SSO", "Custom retention", "Unlimited usage"],
        bestFor: ["writing", "data", "research", "mixed"],
      },
      {
        id: "api",
        name: "API Direct",
        pricePerSeat: 0,
        features: ["Full API access", "All models"],
        bestFor: ["coding", "data"],
      },
    ],
    alternatives: [
      {
        toolId: "claude",
        toolName: "Claude",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 20,
        bestFor: ["writing", "research"],
        capabilityNote: "Stronger on long documents and nuanced writing; same price",
      },
      {
        toolId: "gemini",
        toolName: "Gemini",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 20,
        bestFor: ["research", "mixed"],
        capabilityNote: "Google Search grounding is a genuine advantage for research tasks",
      },
    ],
  },

  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    credexAvailable: true,
    pricingUrl: "https://www.anthropic.com/pricing#anthropic-api",
    plans: [
      {
        id: "api",
        name: "Pay-as-you-go",
        pricePerSeat: 0, // token-based, not seat-based
        features: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Haiku", "Batches API"],
        bestFor: ["coding", "data", "research"],
      },
    ],
    alternatives: [
      {
        toolId: "openai_api",
        toolName: "OpenAI API",
        planId: "api",
        planName: "Pay-as-you-go",
        pricePerSeat: 0,
        bestFor: ["coding", "data"],
        capabilityNote: "GPT-4o is competitive; pricing varies by model and token volume",
      },
    ],
  },

  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    credexAvailable: true,
    pricingUrl: "https://openai.com/api/pricing",
    plans: [
      {
        id: "api",
        name: "Pay-as-you-go",
        pricePerSeat: 0,
        features: ["GPT-4o", "o1", "Embeddings", "Fine-tuning"],
        bestFor: ["coding", "data", "research"],
      },
    ],
    alternatives: [
      {
        toolId: "anthropic_api",
        toolName: "Anthropic API",
        planId: "api",
        planName: "Pay-as-you-go",
        pricePerSeat: 0,
        bestFor: ["coding", "data"],
        capabilityNote: "Claude Haiku is often cheaper than GPT-4o-mini for similar tasks",
      },
    ],
  },

  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    credexAvailable: false,
    pricingUrl: "https://one.google.com/about/ai-premium",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeat: 0,
        features: ["Gemini 1.5 Flash", "Basic tools"],
        bestFor: ["writing", "mixed"],
      },
      {
        id: "pro",
        name: "Google One AI Premium",
        pricePerSeat: 20,
        features: ["Gemini 1.5 Pro", "Gemini in Workspace apps", "2TB storage"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        id: "api",
        name: "API (pay-as-you-go)",
        pricePerSeat: 0,
        features: ["Gemini 1.5 Pro/Flash", "Free tier available"],
        bestFor: ["coding", "data"],
      },
    ],
    alternatives: [
      {
        toolId: "claude",
        toolName: "Claude",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 20,  // correct for monthly; note annual is $17 in PRICING_DATA.md
        bestFor: ["writing", "research"],
        capabilityNote: "Stronger long-context handling; same price point",
      },
    ],
  },

  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "coding",
    credexAvailable: true,
    pricingUrl: "https://windsurf.com/pricing",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeat: 0,
        features: ["Limited completions", "Basic chat"],
        bestFor: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        pricePerSeat: 20,
        features: ["Unlimited completions", "Cascade agent", "Priority models"],
        bestFor: ["coding"],
      },
      {
        id: "teams",
        name: "Teams",
        pricePerSeat: 40,
        minSeats: 5,
        features: ["Everything Pro", "Admin controls", "Audit logs"],
        bestFor: ["coding"],
      },
    ],
    alternatives: [
      {
        toolId: "cursor",
        toolName: "Cursor",
        planId: "pro",
        planName: "Pro",
        pricePerSeat: 20,
        bestFor: ["coding"],
        capabilityNote: "Slightly stronger context window handling; costs $5 more",
      },
      {
        toolId: "github_copilot",
        toolName: "GitHub Copilot",
        planId: "individual",
        planName: "Individual",
        pricePerSeat: 10,
        bestFor: ["coding"],
        capabilityNote: "Cheaper, more mature ecosystem, weaker agentic edits",
      },
    ],
  },
];


export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getPlanById(toolId: string, planId: string): Plan | undefined {
  return getToolById(toolId)?.plans.find((p) => p.id === planId);
}

export const HIGH_VALUE_SAVINGS_THRESHOLD = 500; 
export const LOW_VALUE_SAVINGS_THRESHOLD = 100;   

export const TEAM_PLAN_MIN_SENSIBLE_SEATS = 3;