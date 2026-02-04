import '@testing-library/jest-dom';
import { render, renderHook, screen } from '@testing-library/react';
import { useTranslations } from 'hooks/useTranslations';
import { BooleanValueModel } from 'models/field';
import { useForm } from 'react-hook-form';
import BooleanValue from './BooleanValue';

jest.mock('hooks/useTranslations', () => ({
  useTranslations: jest.fn(),
}));

describe('BooleanValue component', () => {
  const tMock = jest.fn((key) => key);
  const { result } = renderHook(() => useForm());

  beforeAll(() => {
    (useTranslations as jest.Mock).mockReturnValue(tMock);
  });

  it('should disables CheckboxField when readable, not writable, and boolean value is null', () => {
    const value: BooleanValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Boolean',
        inputField: '',
        inputModel: '',
      },
      booleanValue: null,
      id: 'foo',
      __typename: 'BooleanValue',
    };

    render(<BooleanValue value={value} control={result.current.control} />);
    const checkboxField = screen.getByTestId('boolean-value__checkbox-field');
    expect(checkboxField).toBeInTheDocument();
    expect(checkboxField).toBeDisabled();
  });

  it('should renders CheckboxField when writable', () => {
    const value: BooleanValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        fieldType: 'Boolean',
        inputField: '',
        inputModel: '',
      },
      booleanValue: true,
      id: 'foo',
      __typename: 'BooleanValue',
    };

    render(<BooleanValue value={value} control={result.current.control} />);
    const checkboxField = screen.getByTestId('boolean-value__checkbox-field');

    expect(checkboxField).toBeInTheDocument();
    expect(checkboxField).not.toBeDisabled();
  });

  it('should disables CheckboxField when field is not writable', () => {
    const value: BooleanValueModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'Boolean',
        inputField: '',
        inputModel: '',
      },
      booleanValue: true,
      id: 'foo',
      __typename: 'BooleanValue',
    };

    render(<BooleanValue value={value} control={result.current.control} />);
    const checkboxField = screen.getByTestId('boolean-value__checkbox-field');

    expect(checkboxField).toBeInTheDocument();
    expect(checkboxField).toBeDisabled();
  });
});
