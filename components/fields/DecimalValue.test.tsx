import { render, renderHook, screen } from '@testing-library/react';
import { DecimalValueModel } from 'models/field';
import { useForm } from 'react-hook-form';
import DecimalValue from './DecimalValue';

describe('DecimalValue component', () => {
  const { result } = renderHook(() => useForm());

  it('should disables input field when readable, not writable, and no decimal value', () => {
    const value: DecimalValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Decimal',
        inputField: '',
        inputModel: '',
      },
      decimalValue: null,
      id: 'foo',
      __typename: 'DecimalValue',
    };
    render(<DecimalValue value={value} control={result.current.control} />);
    expect(
      screen.getByTestId('decimal-value__input-field')
    ).toBeInTheDocument();
    expect(screen.getByTestId('decimal-value__input-field')).toBeDisabled();
  });

  it('should renders input field when writable', () => {
    const value: DecimalValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        fieldType: 'Decimal',
        inputField: '',
        inputModel: '',
      },
      decimalValue: 25.5,
      id: 'foo',
      __typename: 'DecimalValue',
    };
    render(<DecimalValue value={value} control={result.current.control} />);
    expect(
      screen.getByTestId('decimal-value__input-field')
    ).toBeInTheDocument();
    expect(screen.getByTestId('decimal-value__input-field')).not.toBeDisabled();
  });

  it('should disables input field when field is not writable', () => {
    const value: DecimalValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Decimal',
        inputField: '',
        inputModel: '',
      },
      decimalValue: 30.7,
      id: 'foo',
      __typename: 'DecimalValue',
    };
    render(<DecimalValue value={value} control={result.current.control} />);
    expect(
      screen.getByTestId('decimal-value__input-field')
    ).toBeInTheDocument();
    expect(screen.getByTestId('decimal-value__input-field')).toBeDisabled();
  });
});
