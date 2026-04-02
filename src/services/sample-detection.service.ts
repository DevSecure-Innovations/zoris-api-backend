export const analyzeEmail = (email: any) => {
  const headers = email?.payload?.headers ?? [];

  const from = headers.find((header: any) => header.name === "From")?.value;
  const subject = headers.find((header: any) => header.name === "Subject")?.value;

  console.log("Analyzing:", from, subject);

  const reasons: string[] = [];
  let score = 0;

  if (from?.toLowerCase().includes("paypai.com") || from?.toLowerCase().includes("paypaI.com")) {
    console.log("⚠️ Suspicious domain detected");
    reasons.push("Suspicious sender domain");
    score += 40;
  }

  if (subject?.toLowerCase().includes("urgent")) {
    console.log("⚠️ Urgency-based phishing");
    reasons.push("Urgency-based language in subject");
    score += 20;
  }

  const body = `${email?.snippet ?? ""} ${email?.payload?.body?.data ?? ""}`.toLowerCase();
  if (body.includes("verify") || body.includes("password") || body.includes("click here")) {
    reasons.push("Common phishing keywords found");
    score += 25;
  }

  const label = score >= 45 ? "spam" : score >= 20 ? "suspicious" : "ham";

  return {
    label,
    score: Math.min(score, 100),
    reasons,
    from,
    subject,
  };
};