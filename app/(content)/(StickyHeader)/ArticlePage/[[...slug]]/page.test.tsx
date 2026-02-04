import { render, screen, waitFor } from '@testing-library/react';
import * as dataService from 'services/dataService.server';
import Page from './page';

const mockCookies = jest.fn();
jest.mock('next/headers', () => ({
  headers: jest.fn(),
  cookies: () => ({
    get: (name: string) => mockCookies(name),
  }),
}));

jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));
describe('Article page', () => {
  test('should not render a side menu when the showNavigation is false', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        name: 'Example Page',
        url: '/example-page',
        parents: { nodes: [] },
        children: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        fields: {
          title: 'Example Title',
          introduction: 'This is an example introduction',
          editor: '<p>This is the main content</p>',
          showNavigation: false,
        },
        blocks: { blockContainer: [] },
      },
    });
    const context = { params: Promise.resolve({}) };
    const Result = await Page(context);
    render(Result);

    // Assert that the rendered content matches the expected content
    expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('article__toggle-container')).not.toHaveClass(
      'flex-row-reverse justify-between md:flex-row md:justify-normal'
    );
  });
  test('should render a side menu when the showNavigation is true', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        name: 'Example Page',
        url: '/example-page',
        parents: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        children: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        fields: {
          title: 'Example Title',
          introduction: 'This is an example introduction',
          editor: '<p>This is the main content</p>',
          showNavigation: true,
        },
        blocks: { blockContainer: [] },
      },
    });
    const context = { params: Promise.resolve({}) };
    const Result = await Page(context);
    render(Result);

    waitFor(() => {
      expect(screen.queryByTestId('side-menu')).toBeInTheDocument();
      expect(screen.queryByTestId('article__toggle-container')).toHaveClass(
        'flex-row-reverse justify-between md:flex-row md:justify-normal'
      );
    });
  });
  test('should render correct information of the article', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        name: 'Example Page',
        url: '/example-page',
        parents: { nodes: [] },
        children: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        fields: {
          title: 'Example Title',
          introduction: 'This is an example introduction',
          editor: '<p>This is the main content</p>',
          showNavigation: true,
        },
        blocks: { blockContainer: [] },
      },
    });
    const context = { params: Promise.resolve({}) };
    const Result = await Page(context);
    render(Result);
    waitFor(() => {
      // Assert that the rendered content matches the expected content
      expect(screen.getByTestId('article__title')).toHaveTextContent(
        'Example Title'
      );
      expect(screen.getByTestId('article__introduction')).toHaveTextContent(
        'This is an example introduction'
      );
      expect(screen.getByTestId('article__editor')).toHaveTextContent(
        'This is the main content'
      );
    });
  });
  test('should not render the article title if it is empty', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        name: 'Example Page',
        url: '/example-page',
        parents: { nodes: [] },
        children: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        fields: {
          title: '',
          introduction: 'This is an example introduction',
          editor: '<p>This is the main content</p>',
          showNavigation: true,
        },
        blocks: { blockContainer: [] },
      },
    });
    const context = { params: Promise.resolve({}) };
    const Result = await Page(context);
    render(Result);
    waitFor(() => {
      // Assert that the rendered content matches the expected content
      expect(screen.queryByTestId('article__title')).not.toBeInTheDocument();
      expect(screen.getByTestId('article__introduction')).toHaveTextContent(
        'This is an example introduction'
      );
      expect(screen.getByTestId('article__editor')).toHaveTextContent(
        'This is the main content'
      );
    });
  });
  test('should not render the article introduction if it is null', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        name: 'Example Page',
        url: '/example-page',
        parents: { nodes: [] },
        children: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        fields: {
          title: 'Example Title',
          introduction: null,
          editor: '<p>This is the main content</p>',
          showNavigation: true,
        },
        blocks: { blockContainer: [] },
      },
    });
    const context = { params: Promise.resolve({}) };
    const Result = await Page(context);
    render(Result);
    waitFor(() => {
      // Assert that the rendered content matches the expected content
      expect(screen.getByTestId('article__title')).toHaveTextContent(
        'Example Title'
      );
      expect(
        screen.queryByTestId('article__introduction')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('article__editor')).toHaveTextContent(
        'This is the main content'
      );
    });
  });
  test('should not render the article editor if it is null', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        name: 'Example Page',
        url: '/example-page',
        parents: { nodes: [] },
        children: {
          nodes: [
            {
              name: 'child1',
              url: '/child1',
            },
          ],
        },
        fields: {
          title: 'Example Title',
          introduction: 'This is an example introduction',
          editor: null,
          showNavigation: true,
        },
        blocks: { blockContainer: [] },
      },
    });
    const context = { params: Promise.resolve({}) };
    const Result = await Page(context);
    render(Result);
    waitFor(() => {
      // Assert that the rendered content matches the expected content
      expect(screen.getByTestId('article__title')).toHaveTextContent(
        'Example Title'
      );
      expect(screen.getByTestId('article__introduction')).toHaveTextContent(
        'This is an example introduction'
      );
      expect(screen.queryByTestId('article__editor')).not.toBeInTheDocument();
    });
  });
});
