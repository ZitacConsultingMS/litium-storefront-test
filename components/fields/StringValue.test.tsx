import { render, renderHook, screen } from '@testing-library/react';
import { StringValueModel } from 'models/field';
import { useForm } from 'react-hook-form';
import StringValue from './StringValue';

describe('StringValue component', () => {
  const { result } = renderHook(() => useForm());
  it('should disables input field when readable, not writable, and no string value', () => {
    const value: StringValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Text',
        inputField: '',
        inputModel: '',
      },
      stringValue: '',
      id: 'foo',
      __typename: 'StringValue',
    };
    render(<StringValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('string-value__input-field')).toBeInTheDocument();
    expect(screen.getByTestId('string-value__input-field')).toBeDisabled();
  });

  it('should disables input field when field is email', () => {
    const value: StringValueModel = {
      field: '_email',
      name: 'Email',
      fieldMetadata: {
        readable: true,
        writable: true,
        fieldType: 'Text',
        inputField: '',
        inputModel: '',
      },
      stringValue: 'test@example.com',
      id: 'foo',
      __typename: 'StringValue',
    };
    render(<StringValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('string-value__input-field')).toBeDisabled();
  });

  it('should renders input field when writable and fieldType is "Text"', () => {
    const value: StringValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        fieldType: 'Text',
        inputField: '',
        inputModel: '',
      },
      stringValue: 'Test Value',
      id: 'foo',
      __typename: 'StringValue',
    };
    render(<StringValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('string-value__input-field')).toBeInTheDocument();
    expect(screen.getByTestId('string-value__input-field')).not.toBeDisabled();
  });

  it('should renders textarea field when writable and fieldType is "MultirowText"', () => {
    const value: StringValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        fieldType: 'MultirowText',
        inputField: '',
        inputModel: '',
      },
      stringValue: 'Test Value',
      id: 'foo',
      __typename: 'StringValue',
    };
    render(<StringValue value={value} control={result.current.control} />);
    expect(
      screen.getByTestId('string-value__textarea-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('string-value__textarea-field')
    ).not.toBeDisabled();
  });

  it('should disables InputField when field is not writable', () => {
    const value: StringValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Text',
        inputField: '',
        inputModel: '',
      },
      stringValue: 'Test Value',
      id: 'foo',
      __typename: 'StringValue',
    };

    render(<StringValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('string-value__input-field')).toBeDisabled();
  });

  it('should disables TextareaField when field is not writable', () => {
    const value: StringValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'MultirowText',
        inputField: '',
        inputModel: '',
      },
      stringValue: 'Test Value',
      id: 'foo',
      __typename: 'StringValue',
    };

    render(<StringValue value={value} control={result.current.control} />);
    expect(screen.getByTestId('string-value__textarea-field')).toBeDisabled();
  });
});
