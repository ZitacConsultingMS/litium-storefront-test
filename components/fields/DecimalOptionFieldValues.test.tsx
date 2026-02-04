import '@testing-library/jest-dom';
import { render, renderHook, screen } from '@testing-library/react';
import { DecimalOptionFieldValuesModel } from 'models/field';
import { useForm } from 'react-hook-form';
import { isEmpty } from 'services/formService';
import DecimalOptionFieldValues from './DecimalOptionFieldValues';

jest.mock('services/formService', () => ({
  isEmpty: jest.fn(),
}));

describe('DecimalOptionFieldValues component', () => {
  const { result } = renderHook(() => useForm());

  it('should disables when readable, not writable, and decimal option field values are empty', () => {
    (isEmpty as jest.Mock).mockReturnValue(true);

    const value: DecimalOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        decimalOptions: { items: [], multiSelect: false },
        fieldType: 'DecimalOption',
        inputField: '',
        inputModel: '',
      },
      decimalOptionFieldValues: [],
      id: 'foo',
      __typename: 'DecimalOptionFieldValues',
    };

    render(
      <DecimalOptionFieldValues
        value={value}
        control={result.current.control}
      />
    );
    expect(
      screen.getByTestId('decimal-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('decimal-option-field-values__select-field')
    ).toHaveClass('cursor-default bg-disabled-background');
  });

  it('should renders SelectField when writable', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);

    const value: DecimalOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        decimalOptions: {
          items: [
            { name: 'Option1', value: 1 },
            { name: 'Option2', value: 2 },
          ],
          multiSelect: true,
        },
        fieldType: 'DecimalOption',
        inputField: '',
        inputModel: '',
      },
      decimalOptionFieldValues: [
        { name: 'Option1', value: 1 },
        { name: 'Option2', value: 2 },
      ],
      id: 'foo',
      __typename: 'DecimalOptionFieldValues',
    };

    render(
      <DecimalOptionFieldValues
        value={value}
        control={result.current.control}
      />
    );
    expect(
      screen.getByTestId('decimal-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('decimal-option-field-values__select-field')
    ).toHaveClass('cursor-pointer');
  });

  it('should disables when not writable', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);

    const value: DecimalOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        decimalOptions: { items: [], multiSelect: false },
        fieldType: 'DecimalOption',
        inputField: '',
        inputModel: '',
      },
      decimalOptionFieldValues: [
        { name: 'Option1', value: 1 },
        { name: 'Option2', value: 2 },
      ],
      id: 'foo',
      __typename: 'DecimalOptionFieldValues',
    };

    render(
      <DecimalOptionFieldValues
        value={value}
        control={result.current.control}
      />
    );
    expect(
      screen.getByTestId('decimal-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('decimal-option-field-values__select-field')
    ).toHaveClass('cursor-default bg-disabled-background');
  });
});
