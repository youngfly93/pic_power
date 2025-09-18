import { NextRequest } from 'next/server'

// Server-side proxy to download images while avoiding browser CORS limitations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || `download-${Date.now()}.png`

  if (!url) {
    return new Response('Missing url', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new Response('Invalid url', { status: 400 })
  }

  // Restrict to known image hosts for safety
  const allowedHosts = new Set([
    'ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com',
    'ark-doc.tos-ap-southeast-1.bytepluses.com',
  ])
  if (!allowedHosts.has(parsed.hostname)) {
    return new Response('Host not allowed', { status: 400 })
  }

  const upstream = await fetch(url)
  if (!upstream.ok || !upstream.body) {
    return new Response('Upstream error', { status: upstream.status || 502 })
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream'

  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'private, max-age=0, must-revalidate')
  // RFC 5987/6266: provide ASCII fallback and UTF-8 encoded filename*
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '') || 'download.png'
  const encodedUtf8 = encodeURIComponent(filename)
  headers.set('Content-Disposition', `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`)

  return new Response(upstream.body, { headers })
}

