// Lightweight HTML sanitizer for dangerouslySetInnerHTML usage on the client.
// This is not a full replacement for libraries like DOMPurify, but provides
// a conservative sanitization to remove XSS vectors while preserving basic tags.
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  // Remove script/style/iframe/object blocks
  let sanitized = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');

  // Remove event handlers like onclick="..." or onload='...'
  sanitized = sanitized.replace(/<([a-z0-9]+)([^>]*)\s+on[a-zA-Z]+\s*=\s*(["']).*?\3/gi, '<$1$2');
  sanitized = sanitized.replace(/on[a-zA-Z]+\s*=\s*(["']).*?\1/gi, '');
  // Remove javascript: in attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*(["'])javascript:[^"']+(["'])/gi, '$1="$3"');
  // Optional: remove standalone javascript: in href/src
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Return sanitized HTML
  return sanitized;
}
