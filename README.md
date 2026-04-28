# Zoris-Backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime. 
> Don't use `npm i` to install dependencies it will create ambiguities.

# Google Cloud Setup

To make this project functiuonally run you will need couple of google cloud api and services enabled

## APIs:

- [Cloud Pub/Sub](https://console.cloud.google.com/apis/api/pubsub.googleapis.com)
- [Gmail API](https://console.cloud.google.com/apis/api/gmail.googleapis.com)
- [Gemini API](https://aistudio.google.com/api-keys)

## Services: 

Go your Gooogle Cloud Console & open the cloud shell. Now, to get your Project ID run:

```bash
gcloud config get-value project
```

- Create a topic named `gmail-notifications`:
  
```bash
gcloud pubsub topics create gmail-notifications
```

- Grant authorization to the **Google's Service Account (gmail-api-push@system.gserviceaccount.com)** to push email notifications:

```bash
gcloud pubsub topics add-iam-policy-binding gmail-notifications \
  --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
  --role="roles/pubsub.publisher"
```

- Create a **Pub/Sub Subscription** to the Server's Webhook Endpoint:

```bash
gcloud pubsub subscriptions create gmail-notifications-sub \
  --topic=gmail-notifications \
  --push-endpoint=https://yourdomain.com/webhook/gmail
```

## NOTES

The `--push-endpoint` can't be `localhost:XXXX/webhook/gmail` it has to be a live URL, so to get one forward the port via some service (e.g. `ngrok`)

If you already have set the `--push-endpoint` and want to modify it, then follow to below steps

- Remove the **Pub/Sub Subscription** first:

```bash
gcloud pubsub subscriptions delete gmail-notifications-sub
```

- Recreate a **Pub/Sub Subscription** to the Server's Webhook Endpoint:

```bash
gcloud pubsub subscriptions create gmail-notifications-sub \
  --topic=gmail-notifications \
  --push-endpoint=https://yourdomain.com/webhook/gmail
```

