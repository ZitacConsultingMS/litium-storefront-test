import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuantityInput from './QuantityInput';

describe('Quantity Input Component', () => {
  describe('value', () => {
    describe('with less than or equal to 9', () => {
      test('should select quantity correctly', () => {
        render(<QuantityInput value={3} onChange={() => {}} />);
        let options = screen.getAllByTestId('quantity-input__option');
        expect((options[0] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[1] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[2] as HTMLOptionElement).selected).toBeTruthy();
        expect((options[3] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[4] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[5] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[6] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[7] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[8] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[9] as HTMLOptionElement).selected).toBeFalsy();
      });
      test('should render list of options quantity correctly', () => {
        render(<QuantityInput value={3} onChange={() => {}} />);
        expect(screen.queryAllByTestId('quantity-input__option').length).toBe(
          10
        );
      });
    });
    describe('with greater than 9', () => {
      test('should select quantity correctly', () => {
        render(<QuantityInput value={20} onChange={() => {}} />);
        let options = screen.getAllByTestId('quantity-input__option');
        expect((options[0] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[1] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[2] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[3] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[4] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[5] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[6] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[7] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[8] as HTMLOptionElement).selected).toBeFalsy();
        expect((options[9] as HTMLOptionElement).selected).toBeTruthy();
        expect((options[9] as HTMLOptionElement).text).toBe('20');
        expect((options[10] as HTMLOptionElement).selected).toBeFalsy();
      });
      test('should render list of options quantity correctly', () => {
        render(<QuantityInput value={20} onChange={() => {}} />);
        expect(screen.queryAllByTestId('quantity-input__option').length).toBe(
          11
        );
      });
    });
  });
  describe('action', () => {
    test('should render input element when user chooses "More" option', async () => {
      render(<QuantityInput value={1} onChange={() => {}} />);
      await userEvent.selectOptions(
        screen.getByTestId('quantity-input__select'),
        'quantityinput.option.more'
      );
      expect(screen.getByTestId('quantity-input__input')).toBeInTheDocument();
    });
    test('should check value changes when user chooses a new quantity', async () => {
      render(<QuantityInput value={1} onChange={() => {}} />);
      await userEvent.selectOptions(
        screen.getByTestId('quantity-input__select'),
        '5'
      );
      expect(screen.getByTestId('quantity-input__select')).toHaveValue('5');
    });
    test('should rebuild quantity options when user input a new value', async () => {
      render(<QuantityInput value={1} onChange={() => {}} />);
      await userEvent.selectOptions(
        screen.getByTestId('quantity-input__select'),
        'quantityinput.option.more'
      );
      fireEvent.change(screen.getByTestId('quantity-input__input'), {
        target: { value: '11' },
      });
      await userEvent.click(screen.getByTestId('quantity-input__input-ok'));
      expect(screen.queryAllByTestId('quantity-input__option')[9]).toHaveValue(
        '11'
      );
    });
  });
  test('should apply a custom class name', () => {
    render(<QuantityInput value={1} className="mb-3" />);
    expect(screen.getByTestId('quantity-input__select')).toHaveClass(
      'mb-3 !p-1 text-sm'
    );
  });
});
