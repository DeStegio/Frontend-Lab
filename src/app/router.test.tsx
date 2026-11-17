import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/renderRoute';

describe('routing', () => {
  it('renders the landing page at /', async () => {
    renderRoute('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /make the web misbehave/i }),
    ).toBeInTheDocument();
  });

  it('navigates from landing to about through the main nav', async () => {
    const { router } = renderRoute('/');
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    await userEvent.click(within(nav).getByRole('link', { name: 'About' }));
    expect(router.state.location.pathname).toBe('/about');
    expect(
      await screen.findByRole('heading', { level: 1, name: /allowed to break/i }),
    ).toBeInTheDocument();
  });

  it('lazy-loads the playground with its own app bar', async () => {
    renderRoute('/playground');
    expect(await screen.findByRole('main', { name: 'Playground' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset all conditions' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Playground' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('shows a not-found page for unknown routes', async () => {
    renderRoute('/nope');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
});
