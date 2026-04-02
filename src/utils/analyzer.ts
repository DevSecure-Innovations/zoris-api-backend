import { analyzeTextLocally } from '../utils/localRegex';
import type { 
	AdvancedAnalysis,  
} from '../types/analysis';
import fetch from 'node-fetch';
import type { GeminiResponse, SafeBrowsingResponse } from '../types/google';

const SAFE_BROWSING_API		= process.env.GOOGLE_SAFE_BROWSING_API;
const SAFE_BROWSING_API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
const GEMINI_API			= process.env.GEMINI_API;
const GEMINI_API_KEY		= process.env.GEMINI_API_KEY;

if (!SAFE_BROWSING_API)		throw new Error('Missing Google Safe Browsing API');
if (!SAFE_BROWSING_API_KEY) throw new Error('Missing Google Safe Browsing API key');
if (!GEMINI_API)			throw new Error('Missing Gemini API');
if (!GEMINI_API_KEY)		throw new Error('Missing Gemini API key');

export async function analyzeEmail(
	subject: string,
	body: string,
	urls?: string[]
): Promise<AdvancedAnalysis> {

	const localResult = analyzeTextLocally(subject, body);

	const reasons: string[] = [...localResult.reasons];
	const sources: string[] = ['Local Rules'];

	let totalScore = localResult.riskScore * 0.4;

	if (urls === undefined) urls = [];
	const [safeResults, geminiVerdict] = await Promise.all([
		urls.length > 0 ? checkSafeBrowsing(urls) : Promise.resolve({ maliciousCount: 0 }),
		analyzeWithGemini(subject, body)
	]);


	if (safeResults.maliciousCount > 0) {
		totalScore += 35;
		reasons.push(
			`${safeResults.maliciousCount} URL(s) flagged by Google Safe Browsing`
		);
		sources.push('Google Safe Browsing');
	}


	if (geminiVerdict.isMalicious) {
		totalScore += 20; // slightly reduced weight
		reasons.push(`Gemini flagged: ${geminiVerdict.reason}`);
		sources.push('Gemini');
	}

	const finalScore = Math.min(Math.round(totalScore), 100);
	const isMalicious = finalScore >= 65;

	return {
		isMalicious,
		riskScore: finalScore,
		reasons,
		sources,
	};
}


async function checkSafeBrowsing(urls: string[]) {
	try {
		const res = await fetch(
			`${SAFE_BROWSING_API}?key=${SAFE_BROWSING_API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					client: {
						clientId: 'phishing-detector',
						clientVersion: '1.0.0',
					},
					threatInfo: {
						threatTypes: [
							'MALWARE',
							'SOCIAL_ENGINEERING',
							'UNWANTED_SOFTWARE',
							'POTENTIALLY_HARMFUL_APPLICATION',
						],
						platformTypes: ['ANY_PLATFORM'],
						threatEntryTypes: ['URL'],
						threatEntries: urls.map((url) => ({ url })),
					},
				}),
			}
		);

		const data = (await res.json()) as SafeBrowsingResponse;
		const matches = data.matches || [];

		return { maliciousCount: matches.length };

	} catch {
		return { maliciousCount: 0 };
	}
}


async function analyzeWithGemini(subject: string, body: string) {
	try {
		const prompt = 
		`
		Analyze this email for phishing. Return ONLY JSON: {"isMalicious": true/false, "reason": "short explanation"}
		Subject: ${subject}
		Body: ${body.substring(0, 8000)}
        `;

		const res = await fetch(
			`${GEMINI_API}?key=${GEMINI_API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: [{ parts: [{ text: prompt }] }],
				}),
			}
		);

		const data = (await res.json()) as GeminiResponse;

		let text =
			data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

		// 🔥 FIX: clean markdown if present
		text = text.replace(/```json|```/g, '').trim();

		const json = JSON.parse(text);

		return json;

	} catch {
		return { isMalicious: false, reason: '' };
	}
}
