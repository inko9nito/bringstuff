import { getStore } from '@netlify/blobs';

const ALPHABET = 'abcdefghijkmnopqrstuvwxyz23456789';
const ID_LEN = 10;

function newId() {
  const buf = crypto.getRandomValues(new Uint8Array(ID_LEN));
  let s = '';
  for (let i = 0; i < ID_LEN; i++) s += ALPHABET[buf[i] % ALPHABET.length];
  return s;
}

export default async (req) => {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1] === 'lists' ? null : parts[parts.length - 1];
  const store = getStore('bringstuff-lists');

  if (req.method === 'POST') {
    const body = await req.text();
    const newid = newId();
    await store.set(newid, body || '{}');
    return new Response(newid, { headers: { 'content-type': 'text/plain' } });
  }

  if (!id) return new Response('missing id', { status: 400 });

  if (req.method === 'GET') {
    const val = await store.get(id);
    if (val == null) return new Response('', { status: 404 });
    return new Response(val, { headers: { 'content-type': 'application/json' } });
  }

  if (req.method === 'PUT') {
    const body = await req.text();
    await store.set(id, body);
    return new Response('', { status: 204 });
  }

  return new Response('method not allowed', { status: 405 });
};

export const config = {
  path: ['/.netlify/functions/lists', '/.netlify/functions/lists/*'],
};
