export function setPageSeo(title: string, description?: string) {
  document.title = `${title} | SERVE HUB`;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description ?? 'Find trusted services and providers across Sri Lanka on SERVE HUB.';
}

export function setCanonicalUrl(path: string) {
  const origin = window.location.origin;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = `${origin}${path}`;
}
