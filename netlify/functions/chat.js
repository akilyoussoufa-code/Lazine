const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args));
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY manquante");
      return { statusCode: 500, body: 'OPENAI_API_KEY manquante' };
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (err) {
      return { statusCode: 400, body: 'Body JSON invalide' };
    }
    const { messages, model = 'gpt-4o-mini', temperature = 0.8 } = body;
    if (!Array.isArray(messages)) {
      return { statusCode: 400, body: 'messages doit être un tableau' };
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("OpenAI error", r.status, JSON.stringify(data).slice(0,500));
      return { statusCode: r.status, body: JSON.stringify({ error: data }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || '' })
    };
  } catch (e) {
    console.error("Server error:", e.message);
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
