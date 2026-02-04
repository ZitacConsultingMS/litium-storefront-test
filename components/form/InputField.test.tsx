import { render, renderHook, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import InputField from './InputField';

describe('Input Field Component', () => {
  test('should be able to render input text', () => {
    const { result } = renderHook(() => useForm());
    render(
      <InputField
        control={result.current.control}
        name="test"
        placeholder="name"
        data-testid="input-field"
      ></InputField>
    );
    expect(screen.queryByTestId('input-field')).toBeInTheDocument();
  });
  test('should render correct placeholder', () => {
    const { result } = renderHook(() => useForm());
    render(
      <InputField
        control={result.current.control}
        name="test"
        placeholder="name"
      ></InputField>
    );
    expect(screen.getByLabelText('name')).toBeInTheDocument();
  });
  test('should render input with type text by default', () => {
    const { result } = renderHook(() => useForm());
    render(
      <InputField
        control={result.current.control}
        name="test"
        placeholder="name"
        data-testid="input-field"
      ></InputField>
    );
    expect(screen.queryByTestId('input-field')).toHaveAttribute('type', 'text');
  });
  test('should render correct input type', () => {
    const { result } = renderHook(() => useForm());
    render(
      <InputField
        control={result.current.control}
        name="test"
        placeholder="name"
        type="number"
        data-testid="input-field"
      ></InputField>
    );
    expect(screen.queryByTestId('input-field')).toHaveAttribute(
      'type',
      'number'
    );
  });
  test('should be able to render default value', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { test: 'foo' },
      })
    );

    render(
      <InputField
        control={result.current.control}
        name="test"
        placeholder="name"
        type="number"
        data-testid="input-field"
      ></InputField>
    );
    expect(screen.getByTestId('input-field')).toHaveAttribute('value', 'foo');
  });
  test('should show error message if available', () => {
    const { result } = renderHook(() => useForm());

    result.current.setError('test', {
      type: 'custom',
      message: 'error message',
    });
    render(
      <InputField
        control={result.current.control}
        name="test"
        placeholder="name"
        type="number"
        data-testid="input-field"
      ></InputField>
    );
    expect(screen.getByTestId('error-text')).toHaveTextContent('error message');
  });
});
