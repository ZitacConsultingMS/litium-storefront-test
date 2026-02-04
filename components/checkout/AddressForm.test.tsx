import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddressForm from './AddressForm';

describe('Address Form', () => {
  test('should be able to load form without data', () => {
    render(<AddressForm onSubmit={() => {}}></AddressForm>);
    expect(screen.getByTestId('address-form__first-name')).toHaveValue('');
    expect(screen.getByTestId('address-form__last-name')).toHaveValue('');
    expect(screen.getByTestId('address-form__address')).toHaveValue('');
    expect(screen.getByTestId('address-form__zipcode')).toHaveValue('');
    expect(screen.getByTestId('address-form__city')).toHaveValue('');
    expect(screen.getByTestId('address-form__country')).toHaveValue('');
    expect(screen.getByTestId('address-form__organization-name')).toHaveValue(
      ''
    );
    expect(screen.getByTestId('address-form__email')).toHaveValue('');
    expect(screen.getByTestId('address-form__phone-number')).toHaveValue('');
  });
  test('should be able to load form with value', () => {
    const addressFormData = {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      zipCode: '12345',
      country: 'SE',
      city: 'USA',
      organizationName: 'AnyCompany',
      email: 'test@mail.com',
      phoneNumber: '12345678',
    };
    render(
      <AddressForm onSubmit={() => {}} value={addressFormData}></AddressForm>
    );
    expect(screen.getByTestId('address-form__first-name')).toHaveValue('John');
    expect(screen.getByTestId('address-form__last-name')).toHaveValue('Doe');
    expect(screen.getByTestId('address-form__address')).toHaveValue(
      '123 Main St'
    );
    expect(screen.getByTestId('address-form__zipcode')).toHaveValue('12345');
    expect(screen.getByTestId('address-form__country')).toHaveValue('SE');
    expect(screen.getByTestId('address-form__city')).toHaveValue('USA');
    expect(screen.getByTestId('address-form__organization-name')).toHaveValue(
      'AnyCompany'
    );
    expect(screen.getByTestId('address-form__email')).toHaveValue(
      'test@mail.com'
    );
    expect(screen.getByTestId('address-form__phone-number')).toHaveValue(
      '12345678'
    );
  });
  test('should show required error when submitting empty form', async () => {
    render(<AddressForm onSubmit={() => {}}></AddressForm>);
    await userEvent.click(screen.getByTestId('address-form__submit'));
    expect(screen.queryAllByText('form.required')).toHaveLength(8);
  });
  test('should show error message for invalid email', async () => {
    const { container } = render(
      <AddressForm onSubmit={() => {}}></AddressForm>
    );
    await userEvent.click(screen.getByTestId('address-form__submit'));
    await userEvent.type(screen.getByTestId('address-form__email'), 'test');
    expect(container).toHaveTextContent('form.email.not.valid');
  });
});
