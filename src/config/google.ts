import { google } from 'googleapis';
import type {
	SafeBrowsingResponse,
} from '../types/google';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_SAFE_BROWSING_API = process.env.GOOGLE_SAFE_BROWSING_API;
const GOOGLE_SAFE_BROWSING_API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

if (!GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is not defined');
if (!GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET is not defined');
if (!GOOGLE_REDIRECT_URI) throw new Error('GOOGLE_REDIRECT_URI is not defined');
if (!GOOGLE_SAFE_BROWSING_API) throw new Error('GOOGLE_SAFE_BROWSING_API is not defined');
if (!GOOGLE_SAFE_BROWSING_API_KEY) throw new Error('GOOGLE_SAFE_BROWSING_API_KEY is not defined');

export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

export const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

async function safeBrowsingRequest(urls: string[]) {
	const res = await fetch(`${GOOGLE_SAFE_BROWSING_API}?key=${GOOGLE_SAFE_BROWSING_API_KEY}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			client: {
				clientId: "your-app",
				clientVersion: "1.0",
			},
			threatInfo: {
				threatTypes: [
					"MALWARE",
					"SOCIAL_ENGINEERING",
					"UNWANTED_SOFTWARE",
					"POTENTIALLY_HARMFUL_APPLICATION",
				],
				platformTypes: ["ANY_PLATFORM"],
				threatEntryTypes: ["URL"],
				threatEntries: urls.map((url) => ({ url })),
			},
		}),
	});

	if (!res.ok) {
		throw new Error("Safe Browsing API request failed");
	}

	return (await res.json()) as SafeBrowsingResponse;
}

export async function checkUrlSafety(url: string) {
	const data = await safeBrowsingRequest([url]);

	const threats =
		data.matches?.filter((m) => m.threat.url === url).map((m) => m.threatType) || [];

	return {
		safe: threats.length === 0,
		threats,
	};
}

export async function checkUrlSafetyBatch(urls: string[]) {
	const data = await safeBrowsingRequest(urls);

	return urls.map((url) => {
		const threats =
			data.matches?.filter((m) => m.threat.url === url).map((m) => m.threatType) || [];

		return {
			url,
			safe: threats.length === 0,
			threats,
		};
	});
}
