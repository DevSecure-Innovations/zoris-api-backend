import { oauth2Client, gmail } from '../config/google';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

if (!GCP_PROJECT_ID) throw new Error('Missing GCP_PROJECT_ID');

export async function setupGmailWatch(accessToken: string) {
	oauth2Client.setCredentials({ access_token: accessToken });

	await gmail.users.stop({ userId: 'me' });

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
