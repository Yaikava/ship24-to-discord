# ship24-to-discord

- A simple script to send Ship24 tracking updates to Discord webhook.
- ship24 send a request to our server when they find an update. We then send that update to discord.
- deploy on [deno deploy](https://deno.com/deploy)

## Env variables

- `dhook1`: The webhook URL for your Discord channel.
- `dhook2`: Second optional discord webhook
- `SHIP24_TOKEN`: Your Ship24 API token.
