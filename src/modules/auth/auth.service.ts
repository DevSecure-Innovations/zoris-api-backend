import { google } from 'googleapis';
import { oauth2Client } from "../../config/google";
import type { 
	CallbackBody, 
	CallbackQuery, 
	StartAuthBody 
} from "../../types/auth";
import type { UserTokens } from '../../types/user';
import { setupGmailWatch } from '../../services/gmailService';
import AppError from "../../utils/appError";

const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!CLIENT_SECRET) throw new Error('Missing GOOGLE_CLIENT_SECRET');
if (!CLIENT_ID) throw new Error('Missing GOOGLE_CLIENT_ID');
if (!REDIRECT_URI) throw new Error('Missing GOOGLE_REDIRECT_URI');
/* DESC: Stores user tokens locally
 * TODO: Store in DB
 */
const tokenStore = new Map<string, UserTokens>();
const emailToUserIdStore = new Map<string, string>();
const lastHistoryIdStore = new Map<string, string>();


/* DESC: Handles OAuth flow, returns auth url
 */
export async function startAuth(data: StartAuthBody) {
	if (!data.userId) throw new AppError('userId is required', 400);

	return oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/gmail.modify',
		],
		prompt: 'consent',
		state: data.userId,
	});
}

export async function handleGetCallback(data: CallbackQuery) {
    if (!data.state) throw new AppError('userId is required', 400);
    if (!data.code) throw new AppError('code is required', 400);

    const callbackData: CallbackBody = { 
		code: data.code, 
		userId: data.state 
	};
    await handleCallback(callbackData);
}

/* DESC: Handles OAuth callback
 */
export async function handleCallback(data: CallbackBody) {
	if (!data.code) throw new AppError('code is required', 400);
	if (!data.userId) throw new AppError('userId is required', 400);

	const { code, userId } = data;

	const client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI
	);

	let tokens;

	try {
		const res = await client.getToken(code);
		tokens = res.tokens;
	} catch (err: any) {
		console.error('OAuth token exchange failed:', err?.response?.data || err);
		throw new AppError('Invalid or expired authorization code', 401);
	}

	if (!tokens?.access_token) throw new AppError('Missing access token from Google', 401);

	const existing = tokenStore.get(userId);

	const refreshToken = tokens.refresh_token ?? existing?.refreshToken;

	if (!refreshToken) throw new AppError('No refresh token available. Please re-authenticate with consent.', 401);

	// Set credentials (auto refresh enabled)
	client.setCredentials({
		access_token: tokens.access_token,
		refresh_token: refreshToken,
		expiry_date: tokens.expiry_date ?? existing?.expiryDate,
	});

	// Persist tokens
	tokenStore.set(userId, {
		accessToken: tokens.access_token,
		refreshToken,
		expiryDate: tokens.expiry_date ?? existing?.expiryDate,
	});

	// Resolve the authenticated Gmail address so webhook events can map to this user.
	const gmail = google.gmail({ version: 'v1', auth: client });
	const profile = await gmail.users.getProfile({ userId: 'me' });
	const emailAddress = profile.data.emailAddress;
	if (!emailAddress) throw new AppError('Failed to resolve Gmail address', 500);
	emailToUserIdStore.set(emailAddress.toLowerCase(), userId);

	// Setup Gmail watch (non-blocking)
	try {
		await setupGmailWatch(client);
	} catch (err: any) {
		console.error('Gmail watch setup failed:', err?.response?.data || err);
		// Do NOT throw → user is still authenticated
	}

	return {
		success: true,
		message: 'OAuth successful',
		watchConfigured: true, // you can toggle this if you want
	};
}

/* DESC: Returns user tokens
 */
export function getTokens(userId: string) {
	return tokenStore.get(userId);
}

/* DESC: Resolves app user id by Gmail address
 */
export function getUserIdByEmail(emailAddress: string) {
	return emailToUserIdStore.get(emailAddress.toLowerCase());
}

/* DESC: Returns the last processed Gmail history id for user
 */
export function getLastHistoryId(userId: string) {
	return lastHistoryIdStore.get(userId);
}

/* DESC: Sets the last processed Gmail history id for user
 */
export function setLastHistoryId(userId: string, historyId: string | number) {
	lastHistoryIdStore.set(userId, String(historyId));
}
