import { render } from '@testing-library/react';
import Link from './Link';

const mockLink = jest.fn((props) => <a href={props.href}>{props.children}</a>);
jest.mock('next/link', () => (props: any[]) => mockLink(props));

describe('Link component', () => {
  describe('When prefetch is omitted', () => {
    test('should disable prefetch by default', async () => {
      render(<Link href="/my-pages" />);
      expect(mockLink).toHaveBeenLastCalledWith({
        href: '/my-pages',
        prefetch: false,
      });
    });
    test('should render children', async () => {
      render(<Link href="/my-pages">Home page</Link>);
      expect(mockLink).toHaveBeenLastCalledWith({
        href: '/my-pages',
        prefetch: false,
        children: 'Home page',
      });
    });
  });
  describe('When prefetch is presented', () => {
    test('should disable prefetch if prefetch is false', async () => {
      render(<Link href="/my-pages" prefetch={false} />);
      expect(mockLink).toHaveBeenLastCalledWith({
        href: '/my-pages',
        prefetch: false,
      });
    });
    test('should prefetch if prefetch is true', async () => {
      render(<Link href="/my-pages" prefetch />);
      expect(mockLink).toHaveBeenLastCalledWith({
        href: '/my-pages',
        prefetch: true,
      });
    });
    test('should prefetch if prefetch is set as true', async () => {
      render(<Link href="/my-pages" prefetch={true} />);
      expect(mockLink).toHaveBeenLastCalledWith({
        href: '/my-pages',
        prefetch: true,
      });
    });
    test('should render children', async () => {
      render(
        <Link href="/my-pages" prefetch>
          <span>Home page</span>
        </Link>
      );
      expect(mockLink).toHaveBeenLastCalledWith({
        href: '/my-pages',
        prefetch: true,
        children: <span>Home page</span>,
      });
    });
  });
});
