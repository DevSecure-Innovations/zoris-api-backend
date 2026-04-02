import { oauth2Client } from "../../config/google";
import type { 
	CallbackBody, 
	StartAuthBody 
} from "../../types/auth";
import type { UserTokens } from '../../types/user';
import { setupGmailWatch } from '../../services/gmailService';
import AppError from "../../utils/appError";

/* DESC: Stores user tokens locally
 * TODO: Store in DB
 */
const tokenStore = new Map<string, UserTokens>();


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

/* DESC: Handles OAuth callback
 */
export async function handleCallback(data: CallbackBody) {
	if (!data.code) throw new AppError('code is required', 400);
	if (!data.userId) throw new AppError('userId is required', 400);

	const { code, userId } = data;

	// get tokens, if code and userId are valid
	const { tokens } = await oauth2Client.getToken(code);
	if (!tokens.access_token) throw new AppError('Missing OAuth tokens from Google', 401);
	if (!tokens.refresh_token) throw new AppError('Missing OAuth tokens from Google', 401);

	const accessToken = tokens.access_token;
	const refreshToken = tokens.refresh_token ?? tokenStore.get(userId)?.refreshToken;

	// store tokens locally
	tokenStore.set(userId,{
		accessToken,
		refreshToken,
		expiryDate: tokens.expiry_date ?? undefined,
	});

	// setup gmail watch
	await setupGmailWatch(accessToken);
}

/* DESC: Returns user tokens
 */
export function getTokens(userId: string) {
	return tokenStore.get(userId);
}
