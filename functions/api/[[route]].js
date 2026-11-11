/**
 * CLOUDFLARE PAGES FUNCTIONS ADAPTER: Backend API Layer (/api/*)
 * ส่งต่อทุกคำขอไปยัง handler หลักใน worker/index.js เพื่อใช้โค้ดชุดเดียวกัน 100%
 * ทั้งบน Cloudflare Workers (wrangler.toml) และ Cloudflare Pages Functions
 */
import { onRequest as workerOnRequest } from '../../worker/index.js';

export async function onRequest(context) {
  return workerOnRequest(context);
}

export default {
  async fetch(request, env, ctx) {
    return workerOnRequest({
      request,
      env,
      waitUntil: ctx?.waitUntil?.bind(ctx),
    });
  },
};
