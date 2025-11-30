// lib/openai.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('OPENAI_API_KEY not set. OpenAI calls will fail until it is provided.');
}

/**
 * generateStudyPlan(prompt): calls OpenAI Chat Completions or Responses API
 * and returns the assistant text.
 */
export async function generateStudyPlan(prompt) {
  // Using chat completions endpoint
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-5-mini', // change if needed
    messages: [
      { role: 'system', content: 'Ты — дружелюбный и практичный репетитор, создающий планы подготовки для школьников.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200,
    temperature: 0.3
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${txt}`);
  }

  const data = await resp.json();
  // safe access
  const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
  return content;
}
