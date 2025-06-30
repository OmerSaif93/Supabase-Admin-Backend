import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Replace '*' with your frontend URL in production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method === "POST") {
    const { title, description } = await req.json();
    const { data, error } = await supabase
      .from("entries")
      .insert([{ title, description }])
      .select();

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const entry = data[0];

    // Send data to Strapi
    const strapiRes = await fetch("http://147.182.224.138:1337/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify(entry),
    });

    const strapiData = await strapiRes.json();

    return new Response(JSON.stringify({
      message: "Inserted into Supabase and synced to Strapi",
      supabaseEntry: entry,
      strapiResponse: strapiData,
    }), { status: 200, headers: corsHeaders });

  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("timestamp", { ascending: false });

      console.log("Data fetched from Supabase:", data);
      console.log("error fetched from Supabase:", error);


    if (error)
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: corsHeaders,
      });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
