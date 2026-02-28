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
  let body = "";

  const textContentMatches = html.match(/<td[^>]*class=["']mcnTextContent["'][^>]*>([\s\S]*?)<\/td>/gi);
  if (textContentMatches && textContentMatches.length > 0) {
    const firstContent = textContentMatches[0];
    
    const h1Match = firstContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      title = h1Match[1].replace(/<[^>]+>/g, "").trim();
    }
    
    const pMatches = firstContent.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pMatches && pMatches.length > 0) {
      const textParts: string[] = [];
      for (const p of pMatches) {
        const text = p.replace(/<[^>]+>/g, "").trim();
        if (text && text.length > 0) {
          textParts.push(text);
        }
      }
      body = textParts.slice(0, 2).join(" ");
    }
  }

  if (!title) {
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }
  
  if (!title) {
    const titleMatch2 = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch2) {
      title = titleMatch2[1].trim();
    }
  }

  if (!body) {
    let bodyHtml = html;
    
    const templateHeaderMatch = bodyHtml.match(/<!--\s*templateHeader\s*-->[\s\S]*?<!--\s*\/templateHeader\s*-->/i);
    if (templateHeaderMatch) {
      bodyHtml = bodyHtml.replace(templateHeaderMatch[0], "");
    }
    
    const templateFooterMatch = bodyHtml.match(/<!--\s*templateFooter\s*-->[\s\S]*?<!--\s*\/templateFooter\s*-->/i);
    if (templateFooterMatch) {
      bodyHtml = bodyHtml.replace(templateFooterMatch[0], "");
    }
    
    const canspamMatch = bodyHtml.match(/<!--\s*canspamBarWrapper\s*-->[\s\S]*?<!--\s*\/canspamBarWrapper\s*-->/i);
    if (canspamMatch) {
      bodyHtml = bodyHtml.replace(canspamMatch[0], "");
    }
    
    bodyHtml = bodyHtml.replace(/<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, "");
    body = bodyHtml.trim();
  }

  return { title, body, media };
}
