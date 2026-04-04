import type { 
	GmailMessagePart, 
	GmailMessagePartHeader 
} from '../types/google';

/* DESC: Extracts the body of a Gmail message payload
 * NOTE: Only text/plain and text/html are supported
 */
export function getEmailBodySafe(payload: GmailMessagePart | undefined): string {
	if (!payload) return '';

	// Prefer text/plain
	if (payload.mimeType === 'text/plain' && payload.body?.data) {
		return Buffer.from(payload.body.data, 'base64').toString('utf-8');
	}

	// Fallback to text/html
	if (payload.mimeType === 'text/html' && payload.body?.data) {
		return Buffer.from(payload.body.data, 'base64').toString('utf-8');
	}

	// Recursively check parts
	if (payload.parts && payload.parts.length > 0) {
		for (const part of payload.parts) {
			const body = getEmailBodySafe(part);
			if (body) return body;
		}
	}

	return '';
}

/* DESC: Extracts the Subject header from a Gmail message payload
 */
export function getEmailSubject(payload: GmailMessagePart | undefined): string {
	if (!payload?.headers) return '';

	const subjectHeader = payload.headers.find(
		(h: GmailMessagePartHeader) => h.name?.toLowerCase() === 'subject'
	);

	return subjectHeader?.value ?? '';
}
