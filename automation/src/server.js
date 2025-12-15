import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import { handleApplicationCommand } from './commands.js';

const app = express();
const captureRawBody = (req, _res, buf) => {
  req.rawBody = buf;
};
const PORT = process.env.PORT || 8787;

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'collarts-max4live-automation' });
});

app.post('/interactions', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifyDiscordRequest(req)) {
    return res.status(401).send('Bad signature');
  }

  const message = JSON.parse(req.body.toString('utf8'));

  if (message.type === 1) {
    return res.json({ type: 1 });
  }

  if (message.type === 2) {
    const response = await handleApplicationCommand(message);
    return res.json(response);
  }

  return res.json({ type: 4, data: { content: 'Unsupported interaction type.' } });
});

app.post('/webhooks/github', express.json({ type: '*/*', verify: captureRawBody }), (req, res) => {
  if (!verifyGithubSignature(req)) {
    return res.status(401).send('Invalid GitHub signature');
  }
  const event = req.header('X-GitHub-Event');
  console.log(`[github] ${event}`);
  // TODO: relay to Discord channel via bot token / webhook URL.
  res.status(204).end();
});

app.post('/webhooks/vercel', express.json({ type: '*/*', verify: captureRawBody }), (req, res) => {
  if (!verifyVercelSignature(req)) {
    return res.status(401).send('Invalid Vercel signature');
  }
  console.log(`[vercel] deployment ${req.body?.deployment?.url || 'unknown'}`);
  // TODO: cross-post to Discord with statuses.
  res.status(204).end();
});

function verifyDiscordRequest(req) {
  const signature = req.header('X-Signature-Ed25519');
  const timestamp = req.header('X-Signature-Timestamp');
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!signature || !timestamp || !publicKey) {
    return false;
  }
  const body = req.body;
  const message = Buffer.concat([Buffer.from(timestamp), Buffer.from(body)]);
  return nacl.sign.detached.verify(
    message,
    Buffer.from(signature, 'hex'),
    Buffer.from(publicKey, 'hex')
  );
}

function verifyGithubSignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return true; // cannot verify without secret
  }
  const signature = req.header('X-Hub-Signature-256');
  if (!signature) {
    return false;
  }
  const body = req.rawBody?.length ? req.rawBody : Buffer.from(JSON.stringify(req.body));
  const digest =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function verifyVercelSignature(req) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }
  const signature = req.header('x-vercel-signature');
  if (!signature) {
    return false;
  }
  const body = req.rawBody?.length ? req.rawBody : Buffer.from(JSON.stringify(req.body));
  const digest = crypto.createHmac('sha1', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.listen(PORT, () => {
  console.log(`Automation server listening on port ${PORT}`);
});
