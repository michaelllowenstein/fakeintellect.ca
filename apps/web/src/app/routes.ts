import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/page/home').then((m) => m.HomePage),
    title: 'FakeIntellect — A blog for the confidently uncertain',
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./components/page/blog').then((m) => m.BlogPage),
    title: 'Blog — FakeIntellect',
  },
  {
    path: 'posts/:slug',
    loadComponent: () =>
      import('./components/page/post-detail').then((m) => m.PostDetailPage),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/page/about').then((m) => m.AboutPage),
    title: 'About — FakeIntellect',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/ui/not-found').then((m) => m.NotFound),
    title: '404 — FakeIntellect',
  },
];
