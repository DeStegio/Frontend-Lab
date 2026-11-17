import { createBrowserRouter, type RouteObject } from 'react-router';
import { AboutPage } from '@/features/pages/AboutPage';
import { LandingPage } from '@/features/pages/LandingPage';
import { NotFoundPage } from '@/features/pages/NotFoundPage';
import { SiteLayout } from './layouts/SiteLayout';

export const routes: RouteObject[] = [
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // The playground owns the full viewport, so it sits outside the marketing layout.
    path: 'playground',
    lazy: async () => {
      const { PlaygroundPage } = await import('@/features/playground/PlaygroundPage');
      return { Component: PlaygroundPage };
    },
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
}
