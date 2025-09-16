export const config = {
  runtime: 'edge',
};

const ALLOW_ORIGIN = '*';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() as any });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() as any });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers: corsHeaders() as any });
  }

  const target =
    process.env.SUBGRAPH_URL ||
    // Fallback to any vite-style env the platform might expose server-side
    (process as any)?.env?.VITE_SUBGRAPH_URL ||
    'https://subgraph.satsuma-prod.com/mundovirtual--601218/wolf-cloak-fuji/version/v0.0.1/api';

  try {
    const res = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        ...corsHeaders(),
        'content-type': res.headers.get('content-type') || 'application/json',
      } as any,
    });
  } catch (e: any) {
    return new Response(`Upstream error: ${e?.message || String(e)}`, {
      status: 502,
      headers: corsHeaders() as any,
    });
  }
}

