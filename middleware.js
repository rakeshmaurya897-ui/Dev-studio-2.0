export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default async function middleware(req) {
  const hostname = req.headers.get('host');

  // 1. अगर ये हमारा मेन डोमेन है, तो बिना कुछ किये वेबसाइट को खुलने दो
  if (
    !hostname || 
    hostname.includes('devstudiobuild.in') || 
    hostname.includes('vercel.app') || 
    hostname.includes('localhost')
  ) {
    // 🚨 BUG FIX: Vercel को बताने का सही तरीका कि "इस रिक्वेस्ट को मत रोको"
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    });
  }

  // 2. अगर ये कस्टम डोमेन है, तो Supabase से HTML लाओ
  try {
    const SUPABASE_URL = "https://hoxpbkatpybilssxqkuc.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveHBia2F0cHliaWxzc3hxa3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTQ1NTgsImV4cCI6MjA5MDA5MDU1OH0.Yj7cj4itwWLWCD7rL9RA20X27GG2DSyB5TYXmXkiMuo";
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?custom_domain=eq.${hostname}&select=html_code`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const data = await res.json();
    
    if (data && data.length > 0 && data[0].html_code) {
      return new Response(data[0].html_code, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } else {
      return new Response(`
        <div style="font-family:sans-serif; text-align:center; padding:50px; color:#333;">
          <h2>🚀 Website is almost ready!</h2>
          <p>Domain <b>${hostname}</b> is connected to Dev Studio.</p>
        </div>
      `, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

  } catch(e) {
    return new Response("Error connecting to database.", { status: 500 });
  }
}
