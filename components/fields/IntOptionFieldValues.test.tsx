import '@testing-library/jest-dom';
import { render, renderHook, screen } from '@testing-library/react';
import { IntOptionFieldValuesModel } from 'models/field';
import { useForm } from 'react-hook-form';
import { isEmpty } from 'services/formService';
import IntOptionFieldValues from './IntOptionFieldValues';

jest.mock('services/formService', () => ({
  isEmpty: jest.fn(),
}));

describe('IntOptionFieldValues component', () => {
  const { result } = renderHook(() => useForm());

  it('should disables when readable, not writable, and int option field values are empty', () => {
    (isEmpty as jest.Mock).mockReturnValue(true);

    const value: IntOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        intOptions: { items: [], multiSelect: false },
        fieldType: 'IntOption',
        inputField: '',
        inputModel: '',
      },
      intOptionFieldValues: [],
      id: 'foo',
      __typename: 'IntOptionFieldValues',
    };

    render(
      <IntOptionFieldValues value={value} control={result.current.control} />
    );
    expect(
      screen.getByTestId('int-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('int-option-field-values__select-field')
    ).toHaveClass('cursor-default bg-disabled-background');
  });

  it('should renders SelectField when writable', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);

    const value: IntOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: true,
        intOptions: {
          items: [
            { name: 'Option1', value: 1 },
            { name: 'Option2', value: 2 },
          ],
          multiSelect: true,
        },
        fieldType: 'IntOption',
        inputField: '',
        inputModel: '',
      },
      intOptionFieldValues: [
        { name: 'Option1', value: 1 },
        { name: 'Option2', value: 2 },
      ],
      id: 'foo',
      __typename: 'IntOptionFieldValues',
    };

    render(
      <IntOptionFieldValues value={value} control={result.current.control} />
    );
    expect(
      screen.getByTestId('int-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('int-option-field-values__select-field')
    ).toHaveClass('cursor-pointer');
  });

  it('should disables SelectField when not writable', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);

    const value: IntOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        intOptions: { items: [], multiSelect: false },
        fieldType: 'IntOption',
        inputField: '',
        inputModel: '',
      },
      intOptionFieldValues: [
        { name: 'Option1', value: 1 },
        { name: 'Option2', value: 2 },
      ],
      id: 'foo',
      __typename: 'IntOptionFieldValues',
    };

    render(
      <IntOptionFieldValues value={value} control={result.current.control} />
    );
    expect(
      screen.getByTestId('int-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('int-option-field-values__select-field')
    ).toHaveClass('cursor-default bg-disabled-background');
  });
});
