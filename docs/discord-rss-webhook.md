# Discord RSS Webhook

The Vercel cron route at `/api/discord-rss` checks blog posts once per day and posts new entries to Discord.

## Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

| Name | Required | Value |
| --- | --- | --- |
| `DISCORD_BLOG_WEBHOOK_URL` | yes | Discord channel webhook URL. |
| `CRON_SECRET` | yes | Random secret string, at least 16 characters. Vercel sends it as `Authorization: Bearer ...`. |
| `UPSTASH_REDIS_REST_URL` | yes | Upstash Redis REST URL. |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Upstash Redis REST token. |
| `SITE_URL` | no | Public site URL. Defaults to `https://malloy.vercel.app`. |

## Behavior

- First successful run initializes the latest post as already seen and does not post it.
- Later runs post only new blog posts.
- The cron schedule is daily at `17:00 UTC` in `vercel.json`.

## Manual Test

After deploy, call the route with the secret:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://malloy.vercel.app/api/discord-rss
```
