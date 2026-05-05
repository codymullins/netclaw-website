import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const FALLBACK_IMAGE = 'https://netclaw.dev/assets/social-card.png';

interface ManifestEntry {
  hash: string;
  imageUrl: string;
}

interface Manifest {
  pages: Record<string, ManifestEntry>;
}

let manifest: Manifest | null = null;

function loadManifest(): Manifest {
  if (manifest) return manifest;

  const manifestPath = join(process.cwd(), 'social-images-manifest.json');
  if (existsSync(manifestPath)) {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } else {
    manifest = { pages: {} };
  }
  return manifest!;
}

export const onRequest = defineRouteMiddleware((context) => {
  const m = loadManifest();
  const entryId = context.locals.starlightRoute.entry.id;

  // Strip file extension to get the slug
  const slug = entryId.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
  const entry = m.pages[slug];
  const imageUrl = entry?.imageUrl || FALLBACK_IMAGE;

  context.locals.starlightRoute.head.push(
    {
      tag: 'meta',
      attrs: { property: 'og:image', content: imageUrl },
    },
    {
      tag: 'meta',
      attrs: { property: 'og:image:width', content: '1200' },
    },
    {
      tag: 'meta',
      attrs: { property: 'og:image:height', content: '630' },
    },
    {
      tag: 'meta',
      attrs: { name: 'twitter:image', content: imageUrl },
    },
    {
      tag: 'meta',
      attrs: { name: 'twitter:card', content: 'summary_large_image' },
    },
  );
});
