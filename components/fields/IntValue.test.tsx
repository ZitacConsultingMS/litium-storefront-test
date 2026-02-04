import { render, renderHook, screen } from '@testing-library/react';
import { IntValueModel } from 'models/field';
import { useForm } from 'react-hook-form';
import IntValue from './IntValue';

describe('IntValue component', () => {
  const { result } = renderHook(() => useForm());

  it('should disables input field when readable, not writable, and no integer value', () => {
    const value: IntValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Int',
        inputField: '',
        inputModel: '',
      },
      intValue: null,
      id: 'foo',
      __typename: 'IntValue',
    };
    render(<IntValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('int-value__input-field')).toBeInTheDocument();
    expect(screen.getByTestId('int-value__input-field')).toBeDisabled();
  });

  it('should renders input field when writable', () => {
    const value: IntValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        fieldType: 'Int',
        inputField: '',
        inputModel: '',
      },
      intValue: 123,
      id: 'foo',
      __typename: 'IntValue',
    };
    render(<IntValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('int-value__input-field')).toBeInTheDocument();
    expect(screen.getByTestId('int-value__input-field')).not.toBeDisabled();
  });

  it('should disables input field when not writable', () => {
    const value: IntValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Int',
        inputField: '',
        inputModel: '',
      },
      intValue: 123,
      id: 'foo',
      __typename: 'IntValue',
    };
    render(<IntValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('int-value__input-field')).toBeInTheDocument();
    expect(screen.getByTestId('int-value__input-field')).toBeDisabled();
  });
});
