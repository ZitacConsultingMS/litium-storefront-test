import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EmptyWebsite } from 'contexts/websiteContext';
import { Block } from 'models/block';
import * as websiteServiceServer from 'services/websiteService.server';
import Header from './Header';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams('q=tops')),
}));
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));
jest.mock('services/websiteService.server', () => ({
  get: jest.fn(),
}));

describe('Header', () => {
  beforeEach(() => {
    jest
      .spyOn(websiteServiceServer, 'get')
      .mockResolvedValue(Promise.resolve(EmptyWebsite));
  });
  test('should render magnifier icon onload', async () => {
    const blocks: Block[] = [];
    const jsx = await Header({ blocks });
    render(jsx);
    expect(screen.queryByTestId('header__magnifier')).toBeVisible();
  });
  test('should render magnifier icon onload', async () => {
    const blocks: Block[] = [];
    const jsx = await Header({ blocks });
    render(jsx);
    expect(screen.getByTestId('quicksearch')).toHaveClass('opacity-0');
  });
  test('should show quick search form on magnifier clicked', async () => {
    const blocks: Block[] = [];
    const jsx = await Header({ blocks });
    render(jsx);
    fireEvent.click(screen.getByTestId('header__magnifier'));
    expect(screen.queryByTestId('quicksearch')).not.toHaveClass('opacity-0');
    await waitFor(() => {
      expect(screen.queryByTestId('search__input')).toHaveFocus();
    });
  });
  test('should close quick search form on clicking on close button', async () => {
    const blocks: Block[] = [];
    const jsx = await Header({ blocks });
    render(jsx);
    fireEvent.click(screen.getByTestId('header__magnifier'));
    fireEvent.click(screen.getByTestId('quicksearch__close'));
    expect(screen.getByTestId('quicksearch')).toHaveClass('opacity-0');
  });
});
