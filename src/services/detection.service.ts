export type EmailPayload = {
  id?: string;
  threadId?: string;
  from?: string;
  to?: string | string[];
  subject?: string;
  snippet?: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  receivedAt?: string;
};

export type SpamAnalysis = {
  label: "ham" | "suspicious" | "spam";
  score: number;
  reasons: string[];
  email: EmailPayload;
};

const SPAM_KEYWORDS = [
  "urgent",
  "verify",
  "password",
  "winner",
  "lottery",
  "gift card",
  "crypto",
  "invoice overdue",
  "account suspended",
  "click here",
];

const SUSPICIOUS_DOMAINS = [".ru", ".zip", ".top", ".xyz", ".click"];

const countMatches = (input: string, matcher: RegExp) => {
  return (input.match(matcher) ?? []).length;
};

const extractDomain = (value?: string) => {
  if (!value) return "";

  const emailMatch = value.match(/@([^>\s]+)/);
  if (emailMatch?.[1]) {
    return emailMatch[1].toLowerCase();
  }

  return value.toLowerCase();
};

export const analyzeEmail = (email: EmailPayload): SpamAnalysis => {
  const searchableText = [email.subject, email.snippet, email.text, email.html]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const reasons: string[] = [];
  let score = 0;

  const keywordHits = SPAM_KEYWORDS.filter((keyword) =>
    searchableText.includes(keyword)
  );
  if (keywordHits.length > 0) {
    score += Math.min(keywordHits.length * 18, 36);
    reasons.push(`Spam keywords found: ${keywordHits.join(", ")}`);
  }

  const linkCount = countMatches(searchableText, /https?:\/\//g);
  if (linkCount >= 3) {
    score += 15;
    reasons.push(`Message contains ${linkCount} links`);
  }

  const senderDomain = extractDomain(email.from);
  if (
    senderDomain &&
    SUSPICIOUS_DOMAINS.some((suffix) => senderDomain.endsWith(suffix))
  ) {
    score += 20;
    reasons.push(`Sender domain looks suspicious: ${senderDomain}`);
  }

  if (
    email.subject &&
    email.subject.length > 0 &&
    email.subject === email.subject.toUpperCase()
  ) {
    score += 10;
    reasons.push("Subject is fully capitalized");
  }

  if (!email.subject || email.subject.trim().length === 0) {
    score += 8;
    reasons.push("Missing subject line");
  }

  if ((email.text ?? email.html ?? "").length < 40) {
    score += 5;
    reasons.push("Message body is unusually short");
  }

  const label: SpamAnalysis["label"] =
    score >= 45 ? "spam" : score >= 20 ? "suspicious" : "ham";

  return {
    label,
    score: Math.min(score, 100),
    reasons,
    email,
  };
};