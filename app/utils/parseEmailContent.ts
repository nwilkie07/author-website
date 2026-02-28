export type ParsedEmailContent = {
  title: string;
  body: string;
  media: { src: string; alt: string }[];
};

export function parseMailchimpContent(html: string): ParsedEmailContent {
  const media: { src: string; alt: string }[] = [];
  
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    media.push({ src: match[1], alt: match[2] });
  }
  
  const imgRegex2 = /<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRegex2.exec(html)) !== null) {
    if (!media.find(m => m.src === match![2])) {
      media.push({ src: match[2], alt: match[1] });
    }
  }

  let title = "";
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  
  if (!title) {
    const titleMatch2 = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch2) {
      title = titleMatch2[1].trim();
    }
  }

  let body = html;
  
  const templateHeaderMatch = body.match(/<!--\s*templateHeader\s*-->[\s\S]*?<!--\s*\/templateHeader\s*-->/i);
  if (templateHeaderMatch) {
    body = body.replace(templateHeaderMatch[0], "");
  }
  
  const templateFooterMatch = body.match(/<!--\s*templateFooter\s*-->[\s\S]*?<!--\s*\/templateFooter\s*-->/i);
  if (templateFooterMatch) {
    body = body.replace(templateFooterMatch[0], "");
  }
  
  const canspamMatch = body.match(/<!--\s*canspamBarWrapper\s*-->[\s\S]*?<!--\s*\/canspamBarWrapper\s*-->/i);
  if (canspamMatch) {
    body = body.replace(canspamMatch[0], "");
  }
  
  body = body.replace(/<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, "");
  
  body = body.trim();

  return { title, body, media };
}
