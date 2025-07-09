export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { endpoint, body } = req.body;

  // Read the API key from Vercel environment variables
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  try {
    const mistralRes = await fetch(`https://api.mistral.ai${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await mistralRes.json();
    res.status(mistralRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Proxy error: " + e.message });
  }
}
