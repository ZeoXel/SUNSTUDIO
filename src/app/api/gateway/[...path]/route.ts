/**
 * Gateway Proxy API
 *
 * Routes requests to the configured New API gateway without exposing API keys
 * to the client. Intended for browser-side calls.
 */

import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL || 'https://api.lsaigc.com';
const GATEWAY_API_KEY = process.env.OPENAI_API_KEY || '';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

const buildTargetUrl = (request: NextRequest, path: string[]) => {
  const url = new URL(request.url);
  const pathname = path.join('/');
  const base = GATEWAY_BASE_URL.replace(/\/+$/, '');
  return `${base}/${pathname}${url.search}`;
};

const forward = async (request: NextRequest, path: string[]) => {
  if (!GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: 'Gateway API key not configured' },
      { status: 500 }
    );
  }

  const targetUrl = buildTargetUrl(request, path);

  const headers = new Headers(request.headers);
  for (const h of HOP_BY_HOP_HEADERS) {
    headers.delete(h);
  }
  headers.set('Authorization', `Bearer ${GATEWAY_API_KEY}`);

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD'
    ? undefined
    : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(request, params.path);
}
