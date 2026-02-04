import '@testing-library/jest-dom';
import { render, renderHook, screen } from '@testing-library/react';
import { TextOptionFieldValuesModel } from 'models/field';
import { useForm } from 'react-hook-form';
import { isEmpty } from 'services/formService';
import TextOptionFieldValues from './TextOptionFieldValues';

jest.mock('services/formService', () => ({
  isEmpty: jest.fn(),
}));

describe('TextOptionFieldValues component', () => {
  const { result } = renderHook(() => useForm());

  it('should disables when readable, not writable, and text option field values are empty', () => {
    (isEmpty as jest.Mock).mockReturnValue(true);

    const value: TextOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        readable: true,
        writable: false,
        fieldType: 'TextOption',
        textOptions: { items: [], multiSelect: false },
        inputField: '',
        inputModel: '',
      },
      textOptionFieldValues: [],
      id: 'foo',
      __typename: 'TextOptionFieldValues',
    };

    render(
      <TextOptionFieldValues value={value} control={result.current.control} />
    );
    expect(
      screen.getByTestId('text-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('text-option-field-values__select-field')
    ).toHaveClass('cursor-default bg-disabled-background');
  });

  it('should renders SelectField when writable', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);

    const value: TextOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        fieldType: 'TextOption',
        readable: true,
        writable: true,
        textOptions: {
          items: [
            { name: 'Option 1', value: 'Option1' },
            { name: 'Option 2', value: 'Option2' },
          ],
          multiSelect: true,
        },
        inputField: '',
        inputModel: '',
      },
      textOptionFieldValues: [
        { name: 'Option 1', value: 'Option1' },
        { name: 'Option 2', value: 'Option2' },
      ],
      id: 'foo',
      __typename: 'TextOptionFieldValues',
    };

    render(
      <TextOptionFieldValues value={value} control={result.current.control} />
    );
    expect(
      screen.getByTestId('text-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('text-option-field-values__select-field')
    ).toHaveClass('cursor-pointer');
  });

  it('should disables SelectField when not writable', () => {
    (isEmpty as jest.Mock).mockReturnValue(false);

    const value: TextOptionFieldValuesModel = {
      field: 'testField',
      name: 'Test Field',
      fieldMetadata: {
        fieldType: 'TextOption',
        readable: true,
        writable: false,
        textOptions: { items: [], multiSelect: false },
        inputField: '',
        inputModel: '',
      },
      textOptionFieldValues: [
        { name: 'Option 1', value: 'Option1' },
        { name: 'Option 2', value: 'Option2' },
      ],
      id: 'foo',
      __typename: 'TextOptionFieldValues',
    };

    render(
      <TextOptionFieldValues value={value} control={result.current.control} />
    );
    expect(
      screen.getByTestId('text-option-field-values__select-field')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('text-option-field-values__select-field')
    ).toHaveClass('cursor-default bg-disabled-background');
  });
});
