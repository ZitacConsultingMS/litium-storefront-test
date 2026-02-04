import { render, screen } from '@testing-library/react';
import ErrorText, { ErrorField } from './ErrorText';

describe('Error Text Component', () => {
  test('should not render error message if errors object is empty', () => {
    render(<ErrorText errors={{}}></ErrorText>);
    expect(screen.queryByTestId('error-text')).not.toBeInTheDocument();
  });

  test('should not render error message if errors array is empty', () => {
    render(<ErrorText errors={[]}></ErrorText>);
    expect(screen.queryByTestId('error-text')).not.toBeInTheDocument();
  });

  test('should not render error message if errors message is empty', () => {
    render(<ErrorText errors={{ message: '' }}></ErrorText>);
    expect(screen.queryByTestId('error-text')).not.toBeInTheDocument();
  });

  test('should render correct error message if errors is an object', () => {
    const errors: ErrorField = {
      message: 'error 1',
    };
    render(<ErrorText errors={errors}></ErrorText>);
    expect(screen.queryAllByTestId('error-text').length).toBe(1);
    expect(screen.queryAllByTestId('error-text')[0]).toHaveTextContent(
      'error 1'
    );
  });

  test('should render correct error message if errors is an array', () => {
    const errors: ErrorField[] = [
      {
        message: 'error 1',
      },
      {
        message: 'error 2',
      },
    ];
    render(<ErrorText errors={errors}></ErrorText>);
    expect(screen.queryAllByTestId('error-text').length).toBe(2);
    expect(screen.queryAllByTestId('error-text')[0]).toHaveTextContent(
      'error 1'
    );
    expect(screen.queryAllByTestId('error-text')[1]).toHaveTextContent(
      'error 2'
    );
  });
});
