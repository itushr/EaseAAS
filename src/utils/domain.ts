export function getDomainFromRequest(request?: Request | null): string {
  if (!request) {
    return 'localhost';
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    return forwardedHost.split(',')[0].trim().split(':')[0].toLowerCase();
  }

  const host = request.headers.get('host');
  if (host) {
    return host.split(':')[0].toLowerCase();
  }

  try {
    const url = new URL(request.url);
    return url.hostname.toLowerCase();
  } catch {
    return 'localhost';
  }
}
