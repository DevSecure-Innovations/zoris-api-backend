import type {
	PubSubMessage,
} from '../../types/google';
import { gmail, oauth2Client } from '../../config/google';
import { analyzeEmail } from '../../utils/analyzer';
import {
	getLastHistoryId,
	getTokens,
	getUserIdByEmail,
	setLastHistoryId,
} from '../auth/auth.service';
import AppError from '../../utils/appError';

/* DESC: Handles Gmail webhook events 
 */
export async function gmailWebhook(message: PubSubMessage) {
	if (!message.data) throw new AppError('No data', 400);
	const parsedData = JSON.parse(Buffer.from(message.data, 'base64').toString()) as {
		emailAddress?: string;
		historyId?: string | number;
	};

	const { emailAddress, historyId } = parsedData;
	if (!emailAddress) throw new AppError('No emailAddress', 400);
	if (!historyId) throw new AppError('No historyId', 400);

	const userId = getUserIdByEmail(emailAddress);
	if (!userId) throw new AppError('No user mapped for email address', 401);

	const tokens = getTokens(userId);
	if (!tokens) throw new AppError('No tokens', 401);

	oauth2Client.setCredentials({
		access_token: tokens.accessToken,
		refresh_token: tokens.refreshToken,
		expiry_date: tokens.expiryDate,
	});


	const previousHistoryId = getLastHistoryId(userId);

	// First webhook for a user initializes the cursor, next events fetch deltas.
	if (!previousHistoryId) {
		setLastHistoryId(userId, historyId);
		return;
	}

	const history = await gmail.users.history.list({
		userId: 'me',
		startHistoryId: previousHistoryId,
	});

	const messages = history.data.history?.flatMap(h => h.messagesAdded || []) || [];

	for (const msg of messages) {
		if (!msg.message?.id) continue;

		const email = await gmail.users.messages.get({
			userId: 'me',
			id: msg.message.id,
			format: 'full',
		});

		const subject = email.data.payload?.headers?.find(h => h.name === 'Subject')?.value || '';
		let body = '';
		if (email.data.payload?.body?.data) {
			body = Buffer.from(email.data.payload.body.data, 'base64').toString();
		}

		const result = await analyzeEmail(subject, body);

		if (result.isMalicious) {
			console.log(`PHISHING DETECTED! Score: ${result.riskScore}`);
			console.log('Reasons:', result.reasons);

		}
	}

	setLastHistoryId(userId, historyId);
}
