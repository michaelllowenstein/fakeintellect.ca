import React from 'react';
import { createRoot, Root } from 'react-dom/client';

// Dynamic imports for code-splitting
const islandRegistry: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  FeaturedPostsGrid:  () => import('./FeaturePostsGrid'),
  StatsTicker:        () => import('./StatsTicker'),
  NewsletterSignup:   () => import('./NewsletterSignup'),
  CommentThread:      () => import('./CommentThread'),
  PostReactions:      () => import('./PostReactions'),
  SearchModal:        () => import('./SearchModal'),
  ReadingProgress:    () => import('./ReadingProgress'),
};

const roots = new WeakMap<HTMLElement, Root>();

export function mountIsland(
  container: HTMLElement,
  name: string,
  props: Record<string, unknown>,
): () => void {
  const loader = islandRegistry[name];
  if (!loader) {
    console.warn(`[ReactBridge] Unknown island: ${name}`);
    return () => {};
  }

  let root: Root;
  if (roots.has(container)) {
    root = roots.get(container)!;
  } else {
    root = createRoot(container);
    roots.set(container, root);
  }

  loader().then(({ default: IslandComponent }) => {
    root.render(React.createElement(IslandComponent, props as any));
  }).catch((err) => {
    console.error(`[ReactBridge] Failed to load island "${name}":`, err);
  });

  return () => {
    // Use setTimeout to avoid unmounting during React render cycle
    setTimeout(() => {
      root.unmount();
      roots.delete(container);
    }, 0);
  };
}
