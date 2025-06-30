import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Replace '*' with your frontend URL in production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };
  const body = await req.json();

  const strapiUrl = Deno.env.get("STRAPI_SYNC_URL")!; // e.g. http://your-droplet-ip:1337/api/sync

  const res = await fetch(strapiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return new Response("Forwarded to Strapi", { status: res.status });
});
