# phising-api-backend

## Endpoints

- `GET /health` returns a basic health check.
- `POST /pubsub` accepts Gmail Pub/Sub push notifications, fetches the referenced Gmail messages, and runs them through the local analyzer.
- `POST /detect/spam` accepts a raw email payload and returns a dummy spam analysis result.

## Expected payload for `/detect/spam`

```json
{
	"from": "alerts@example.com",
	"subject": "Urgent account update",
	"snippet": "Click here to verify your account",
	"text": "Click here to verify your account now"
}
```

The analyzer is intentionally heuristic-based for now. It marks messages as `ham`, `suspicious`, or `spam` and returns the reasons behind the score.