#!/usr/bin/env node
// Prints fresh secrets for .env.local:
//   CHALLENGE_SECRET   HMAC secret for the 90-second challenge tokens
//   ISSUER_PRIVATE_JWK ES256 private key (JWK, one line) that signs skill passes
// The public half is derived at runtime and served at /.well-known/jwks.json.
import { generateKeyPair, exportJWK, calculateJwkThumbprint } from 'jose';
import { randomBytes } from 'node:crypto';

const { privateKey } = await generateKeyPair('ES256', { extractable: true });
const jwk = await exportJWK(privateKey);
jwk.kid = (await calculateJwkThumbprint(jwk)).slice(0, 16);
jwk.alg = 'ES256';
jwk.use = 'sig';

console.log(`CHALLENGE_SECRET=${randomBytes(32).toString('base64url')}`);
console.log(`ISSUER_PRIVATE_JWK=${JSON.stringify(jwk)}`);
console.error('\nPaste both lines into .env.local (and Vercel env vars). Never commit them.');
