import { google } from "googleapis";
import { oauth2Client } from "../config/google";
import { analyzeEmail, type EmailPayload, type SpamAnalysis } from "./detection.service";

type GmailHeader = {
  name?: string | null;
  value?: string | null;
};

type GmailPayload = {
  mimeType?: string | null;
  body?: {
    data?: string | null;
    size?: number | null;
  } | null;
  headers?: GmailHeader[] | null;
  parts?: GmailPayload[] | null;
};

const decodeBase64Url = (input?: string | null) => {
  if (!input) return "";

  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
};

const getHeaderValue = (headers: GmailHeader[] | null | undefined, name: string) => {
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
    ?.value?.trim();
};

const extractBodyFromPayload = (payload?: GmailPayload | null) => {
  if (!payload) return { text: "", html: "" };

  const directText =
    payload.mimeType === "text/plain" ? decodeBase64Url(payload.body?.data) : "";
  const directHtml =
    payload.mimeType === "text/html" ? decodeBase64Url(payload.body?.data) : "";

  const nested = (payload.parts ?? []).reduce(
    (accumulator, part) => {
      const child = extractBodyFromPayload(part);
      return {
        text: accumulator.text || child.text,
        html: accumulator.html || child.html,
      };
    },
    { text: "", html: "" }
  );

  return {
    text: directText || nested.text,
    html: directHtml || nested.html,
  };
};

export const getMessage = async (messageId: string): Promise<EmailPayload> => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const payload = message.data.payload ?? null;
  const headers = payload?.headers ?? [];
  const body = extractBodyFromPayload(payload);

  return {
    id: message.data.id ?? undefined,
    threadId: message.data.threadId ?? undefined,
    from: getHeaderValue(headers, "From"),
    to: getHeaderValue(headers, "To"),
    subject: getHeaderValue(headers, "Subject"),
    snippet: message.data.snippet ?? undefined,
    text: body.text,
    html: body.html,
    headers: headers.reduce<Record<string, string>>((accumulator, header) => {
      if (header.name && header.value) {
        accumulator[header.name] = header.value;
      }

      return accumulator;
    }, {}),
    receivedAt: message.data.internalDate
      ? new Date(Number(message.data.internalDate)).toISOString()
      : undefined,
  };
};

export const analyzeMessage = async (messageId: string): Promise<SpamAnalysis> => {
  const email = await getMessage(messageId);
  return analyzeEmail(email);
};

export const startWatch = async () => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const res = await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: process.env.PUBSUB_TOPIC!,
      labelIds: ["INBOX"],
    },
  });

  return res.data;
};

export const processHistory = async (historyId: string) => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const history = await gmail.users.history.list({
    userId: "me",
    startHistoryId: historyId,
    historyTypes: ["messageAdded"],
  });

  const messageIds =
    history.data.history?.flatMap((entry) =>
      entry.messagesAdded?.flatMap((message) => (message.message?.id ? [message.message.id] : [])) ?? []
    ) ?? [];

  const uniqueMessageIds = [...new Set(messageIds)];
  const analyses = await Promise.all(uniqueMessageIds.map((messageId) => analyzeMessage(messageId)));

  return analyses;
};