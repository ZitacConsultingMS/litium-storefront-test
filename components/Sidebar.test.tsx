import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  test('should render sidebar with children prop correctly when visible flag is true', async () => {
    render(
      <Sidebar visible={true} onClose={() => {}} data-testid="sidebar">
        <span data-testid="sidebar__children">Render Children</span>
      </Sidebar>
    );
    expect(screen.getByTestId('sidebar')).toHaveClass('right-0');
    expect(screen.getByTestId('sidebar__backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar__children')).toHaveTextContent(
      'Render Children'
    );
  });
  test('should not render sidebar with visible flag is false', async () => {
    render(
      <Sidebar visible={false} onClose={() => {}} data-testid="sidebar">
        <span data-testid="sidebar__children">Render Children</span>
      </Sidebar>
    );
    expect(screen.getByTestId('sidebar')).toHaveClass('-right-full');
    expect(screen.queryByTestId('sidebar__backdrop')).toBeNull();
  });
  test('should set scale to zero when visible is false to not cover header component', () => {
    render(
      <Sidebar visible={false} onClose={() => {}} data-testid="sidebar">
        <span data-testid="sidebar__children">Render Children</span>
      </Sidebar>
    );
    expect(screen.getByTestId('sidebar')).toHaveClass('scale-x-0');
  });
  test('should be able to scroll on document body if blockScroll flag is false', async () => {
    render(
      <Sidebar visible={true} onClose={() => {}}>
        <span data-testid="sidebar__children">Render Children</span>
      </Sidebar>
    );
    expect(document.body).not.toHaveStyle({
      position: 'relative',
      overflow: 'hidden',
    });
  });
  test('should not be able to scroll on document body if blockScroll flag is true and visible flag is true', async () => {
    render(
      <Sidebar visible={true} onClose={() => {}} blockScroll={true}>
        <span data-testid="sidebar__children">Render Children</span>
      </Sidebar>
    );
    expect(document.body).toHaveStyle({
      position: 'relative',
      overflow: 'hidden',
    });
  });
});
