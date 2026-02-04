import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { FieldValues } from './FieldValues';

jest.mock('hooks/useTranslations', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('services/imageService', () => ({
  getAbsoluteImageUrl: (item: any, serverUrl: string) =>
    `${serverUrl}/${item.src}`,
}));

const websiteContextValue = {
  ...EmptyWebsite,
  imageServerUrl: 'http://example.com/',
};

describe('FieldValues Component', () => {
  test('renders text option field values', () => {
    const field = {
      textOptionFieldValues: [{ name: 'Option 1' }, { name: 'Option 2' }],
    };
    render(
      <WebsiteContext.Provider value={websiteContextValue}>
        <FieldValues {...field} />
      </WebsiteContext.Provider>
    );
    expect(screen.getByText('Option 1; Option 2')).toBeInTheDocument();
  });

  test('renders HTML text field', () => {
    const field = { stringValue: '<p>Some HTML content</p>' };
    render(<FieldValues {...field} />);
    expect(screen.getByText('Some HTML content')).toBeInTheDocument();
  });

  test('renders link as media file', () => {
    const field = {
      pointerMediaFileValue: {
        item: { url: 'http://example.com/file', filename: 'file.pdf' },
      },
    };
    render(<FieldValues {...field} />);
    expect(screen.getByText('file.pdf')).toBeInTheDocument();
  });

  test('renders link field value', () => {
    const field = {
      linkFieldValue: { url: 'http://example.com', text: 'External Link' },
    };
    render(<FieldValues {...field} />);
    expect(screen.getByText('External Link')).toBeInTheDocument();
  });

  test('renders image field', () => {
    const field = {
      pointerMediaImageValue: {
        item: {
          src: 'image.jpg',
          filename: 'image.jpg',
          dimension: { width: 100, height: 100 },
        },
      },
    };
    render(
      <WebsiteContext.Provider value={websiteContextValue}>
        <FieldValues {...field} />
      </WebsiteContext.Provider>
    );
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute(
      'src',
      '/_next/image?url=http%3A%2F%2Fexample.com%2F%2Fimage.jpg&w=256&q=75'
    );
    expect(image).toHaveAttribute('alt', 'image.jpg');
  });

  test('renders boolean field', () => {
    const field = { booleanValue: true };
    render(<FieldValues {...field} />);
    expect(
      screen.getByText('productdetail.field.boolean.true')
    ).toBeInTheDocument();
  });

  test('renders long value', () => {
    const field = { longValue: 1234567890123 };
    render(<FieldValues {...field} />);
    expect(screen.getByText('1234567890123')).toBeInTheDocument();
  });

  test('renders int value', () => {
    const field = { intValue: 42 };
    render(<FieldValues {...field} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('renders int option field values', () => {
    const field = {
      intOptionFieldValues: [{ name: 'Choice 1' }, { name: 'Choice 2' }],
    };
    render(<FieldValues {...field} />);
    expect(screen.getByText('Choice 1; Choice 2')).toBeInTheDocument();
  });

  test('renders decimal value', () => {
    const field = { decimalValue: 99.99 };
    render(<FieldValues {...field} />);
    expect(screen.getByText('99.99')).toBeInTheDocument();
  });

  test('renders formatted date if dateTimeValue is present', () => {
    const field = { dateTimeValue: '2023-10-15T08:30:00.000Z' };
    render(<FieldValues {...field} />);
    expect(screen.getByText('2023-10-15')).toBeInTheDocument();
  });

  test('returns null if all fields are empty', () => {
    const field = {};
    const { container } = render(<FieldValues {...field} />);
    expect(container).toBeEmptyDOMElement();
  });
});
