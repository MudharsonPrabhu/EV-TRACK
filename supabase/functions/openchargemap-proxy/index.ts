import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queryParams } = await req.json();
    
    if (!queryParams) {
      throw new Error('Query parameters are required');
    }
    
    // Construct the OpenChargeMap API URL
    const targetURL = `https://api.openchargemap.io/v3/poi/?${queryParams}`;
    
    console.log('Proxying request to OpenChargeMap:', targetURL);
    
    // Make the API call to OpenChargeMap
    const apiResponse = await fetch(targetURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EVTrack-ExpansionSimulator/1.0'
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`OpenChargeMap API responded with status: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    console.log(`OpenChargeMap API returned ${Array.isArray(data) ? data.length : 'unknown'} results`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in OpenChargeMap proxy:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});