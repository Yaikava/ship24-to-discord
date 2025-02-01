import { serve } from "https://deno.land/std@0.186.0/http/server.ts";

const webhookUrl1 = Deno.env.get("dhook1");
const webhookUrl2 = Deno.env.get("dhook2");
const ship24Token = Deno.env.get("SHIP24_TOKEN");

const handler = async (req: Request): Promise<Response> => {
  if (!webhookUrl1) {
    console.error("Missing environment variable: dhook1");
    return new Response("Internal config error", { status: 500 });
  }

  if (!ship24Token) {
    console.error("Missing environment variable: SHIP24_TOKEN");
    return new Response("Internal config error", { status: 500 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${ship24Token}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { trackings } = await req.json();

    if (trackings.length === 0) {
      return new Response("No trackings found", { status: 200 });
    }

    const tracking = trackings[0]; // Assuming you want to process the first tracking

    const status = tracking.shipment.statusCode;
    const trackingNumber = tracking.tracker.trackingNumber;
    const recipientName = tracking.shipment.recipient.name;
    const firstEventLocation = tracking.events[0]?.location || "Location not available";
    const locationStatus = tracking.events[0]?.status || "No location status";

    const message = `**Shipping Update Status:** ${status}, **Location**: ${locationStatus} ${firstEventLocation}`;

    const sendWebhook = async (url: string) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        throw new Error(`Error sending webhook: ${response.statusText}`);
      }
    };

    await sendWebhook(webhookUrl1);

    if (webhookUrl2) {
      await sendWebhook(webhookUrl2);
    }

    return new Response("Webhook sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Error processing request", { status: 500 });
  }
};

serve(handler);
