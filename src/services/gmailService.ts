import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

if (!GCP_PROJECT_ID) throw new Error('Missing GCP_PROJECT_ID');

export async function setupGmailWatch(client: OAuth2Client) {
	const gmail = google.gmail({
		version: 'v1',
		auth: client, 
	});

	// Stop previous watch (optional but good practice)
	try {
		await gmail.users.stop({ userId: 'me' });
	} catch (err) {
		// ignore if no existing watch
	}

	const res = await gmail.users.watch({
		userId: 'me',
		requestBody: {
			topicName: `projects/${GCP_PROJECT_ID}/topics/gmail-notifications`,
			labelIds: ['INBOX'],
		},
	});

	console.log('gmail watch activated:', res.data);
	return res.data;
}
