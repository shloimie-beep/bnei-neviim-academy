import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env.local');
const DEFAULT_BASE_URL = 'https://api.moonshot.ai/v1';
const DEFAULT_MODEL = 'kimi-k2.5';
const DEFAULT_SYSTEM_PROMPT =
  'You are Kimi in a local terminal session. Be practical, concise, and helpful, especially for coding and operations tasks.';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) {
      process.env[key] = rest.join('=');
    }
  }
}

async function callKimi(messages) {
  const apiKey = process.env.KIMI_API_KEY;
  const baseUrl = (process.env.KIMI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = process.env.KIMI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error('KIMI_API_KEY is missing');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      thinking: { type: 'disabled' },
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kimi API ${response.status}: ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content.map((part) => part?.text || '').join('').trim();
    if (text) return text;
  }
  return '(no response text)';
}

loadEnvFile(ENV_PATH);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let messages = [
  {
    role: 'system',
    content: process.env.KIMI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
  },
];

function ask(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

console.log('Kimi terminal chat is ready.');
console.log('Commands: /exit to quit, /new to reset chat history.');

while (true) {
  const input = (await ask('\nYou: ')).trim();

  if (!input) continue;
  if (input === '/exit') break;
  if (input === '/new') {
    messages = [messages[0]];
    console.log('Chat history reset.');
    continue;
  }

  messages.push({ role: 'user', content: input });

  try {
    const reply = await callKimi(messages);
    messages.push({ role: 'assistant', content: reply });
    console.log(`\nKimi: ${reply}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nKimi error: ${message}`);
  }
}

rl.close();
