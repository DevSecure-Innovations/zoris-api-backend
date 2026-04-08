export const REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
  PHONE: /\+?\d{10,15}/g,
  SHORTENED_URL: /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|short\.io/i,
  SUSPICIOUS_DOMAIN: /\.(xyz|top|fun|tk|ml|ga|cf|pw|ru|cn)/i, // removed .in (avoid false positives)
} as const;

const URGENCY_KEYWORDS = [
  'urgent', 'immediately', 'act now', 'click here', 'verify now',
  'account blocked', 'account suspended', 'account locked',
  'security alert', 'fraud alert', 'otp', 'password', 'pin',
  'update required', 'confirm your details', 'do not share',
  'your account will be closed', 'refund', 'government notice',
  'aadhaar', 'pan card', 'upi', 'bank alert'
];

const SUSPICIOUS_PHRASES = [
  'your account will be closed',
  'confirm your details immediately',
  'we have detected suspicious activity',
  'click the link to verify',
  'do not reply to this message'
];

const COMMON_BRANDS = [
  'sbi', 'hdfc', 'icici', 'axis', 'bankofindia', 'pnb', 'canara',
  'paypal', 'amazon', 'google', 'microsoft', 'apple', 'gov.in'
];

export function extractEntities(text: string) {
  const urls = text.match(REGEX.URL) || [];
  const emails = text.match(REGEX.EMAIL) || [];
  const phones = text.match(REGEX.PHONE) || [];

  return { urls, emails, phones };
}

export function analyzeTextLocally(subject: string, body: string) {
  const text = `${subject} ${body}`.toLowerCase();

  let riskScore = 0;
  const reasons: string[] = [];

  const { urls } = extractEntities(text);


  const urgencyHits = URGENCY_KEYWORDS.filter(k => text.includes(k));
  if (urgencyHits.length > 0) {
    riskScore += 15;
    reasons.push(`Urgency keywords detected (${urgencyHits.length})`);
  }


  const phraseHits = SUSPICIOUS_PHRASES.filter(p => text.includes(p));
  if (phraseHits.length > 0) {
    riskScore += 20;
    reasons.push(`Suspicious phrases found`);
  }


  if (urls.length > 0) {
    riskScore += 10;
    reasons.push(`Contains ${urls.length} URL(s)`);

    urls.forEach(url => {
      try {
        const domain = new URL(url).hostname.toLowerCase();

        
        if (REGEX.SHORTENED_URL.test(domain)) {
          riskScore += 15;
          reasons.push(`Shortened URL used (${domain})`);
        }

        
        if (REGEX.SUSPICIOUS_DOMAIN.test(domain)) {
          riskScore += 10;
          reasons.push(`Suspicious domain TLD (${domain})`);
        }

       
        const matchedBrand = COMMON_BRANDS.find(brand =>
          domain.includes(brand) && !domain.endsWith(brand + '.com')
        );

        if (matchedBrand) {
          riskScore += 20;
          reasons.push(`Possible brand spoofing (${matchedBrand})`);
        }

      } catch {
       
      }
    });
  }

  if (
    text.includes('otp') ||
    text.includes('password') ||
    text.includes('pin')
  ) {
    riskScore += 20;
    reasons.push('Requests sensitive information (OTP/password)');
  }

 
  if (text.includes('refund') || text.includes('cashback')) {
    riskScore += 10;
    reasons.push('Financial lure detected');
  }

  
  const finalScore = Math.min(riskScore, 100);
  const isMalicious = finalScore >= 50;

  return {
    isMalicious,
    riskScore: finalScore,
    reasons,
    extracted: extractEntities(text),
  };
}