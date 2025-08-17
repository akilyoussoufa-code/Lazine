const fetch = global.fetch || ((...a)=>import('node-fetch').then(({default:f})=>f(...a)));
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST')
      return { statusCode: 405, body: 'Method Not Allowed' };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: 'OPENAI_API_KEY manquante' };

    const { messages, model='gpt-4o-mini', temperature=0.8 } = JSON.parse(event.body||'{}');
    if (!Array.isArray(messages)) return { statusCode: 400, body: 'messages[] requis' };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature })
    });
    const data = await r.json();
    if (!r.ok) return { statusCode:r.status, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) };

    return { statusCode:200, headers:{'Content-Type':'application/json'}, body:JSON.stringify({ reply:data.choices?.[0]?.message?.content||'' }) };
  } catch(e) {
    return { statusCode:500, body:`Server error: ${e.message}` };
  }
};

