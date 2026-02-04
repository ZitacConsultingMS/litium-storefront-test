import { yupResolver } from '@hookform/resolvers/yup';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import DropdownField from './DropdownField';

const schemaAddress = yup.object({
  testing: yup.string().required('Required'),
});

type AddressFormData = yup.InferType<typeof schemaAddress>;
describe('Dropdown Field Component', () => {
  test('should render not render dropdown list if items array is empty', () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: '',
        },
      });
      return (
        <DropdownField name="testing" placeholder="Country" control={control} />
      );
    };
    render(<Component />);
    expect(screen.queryByTestId('dropdown-field__item')).toBeNull();
  });
  test('should render dropdown list if items array is not empty', () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: '',
        },
      });
      return (
        <DropdownField
          name="testing"
          placeholder="Tesing"
          items={[
            { code: 'SE', name: 'Sweden' },
            { code: 'US', name: 'United States' },
          ]}
          control={control}
          idSelector={(option) => option.code}
        />
      );
    };
    render(<Component />);
    expect(screen.queryAllByTestId('dropdown-field__item').length).toBe(2);
  });
  test('should not render selected option if default value is empty', () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: '',
        },
      });
      return (
        <DropdownField name="testing" placeholder="Country" control={control} />
      );
    };
    render(<Component />);
    expect(screen.queryByTestId('dropdown-field__name')).toBeNull();
  });
  test(`should render selected option if default value is not empty`, () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: 'SE',
        },
      });
      return (
        <DropdownField
          name="testing"
          placeholder="Country"
          control={control}
          items={[
            { code: 'SE', name: 'Sweden' },
            { code: 'US', name: 'United States' },
          ]}
          idSelector={(option) => option.code}
          textSelector={(option) => option.name}
        />
      );
    };
    render(<Component />);
    expect(screen.getByTestId('dropdown-field__name')).toHaveTextContent(
      'Sweden'
    );
  });
  test('should open the dropdown when clicking on the placeholder', async () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: '',
        },
      });
      return (
        <DropdownField
          name="testing"
          placeholder="Country"
          control={control}
          items={[
            { code: 'SE', name: 'Sweden' },
            { code: 'US', name: 'United States' },
          ]}
          idSelector={(option) => option.code}
          textSelector={(option) => option.name}
        />
      );
    };
    render(<Component />);
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));
    expect(screen.getByTestId('dropdown-field__list')).toHaveClass(
      'scale-y-100 opacity-100'
    );
  });

  test('should clickable on dropdown item', async () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: '',
        },
      });
      return (
        <DropdownField
          name="testing"
          placeholder="Country"
          control={control}
          items={[
            { code: 'SE', name: 'Sweden' },
            { code: 'US', name: 'United States' },
          ]}
          idSelector={(option) => option.code}
          textSelector={(option) => option.name}
          dataTestId={'dropdown-field__value'}
        />
      );
    };
    render(<Component />);
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));
    expect(screen.getByTestId('dropdown-field__list')).toHaveClass(
      'scale-y-100 opacity-100'
    );
    const items = screen.queryAllByTestId('dropdown-field__item');
    act(() => {
      items[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(screen.getByTestId('dropdown-field__name')).toHaveTextContent(
      'Sweden'
    );
    expect(screen.getByTestId('dropdown-field__value')).toHaveValue('SE');
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));
    act(() => {
      items[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(screen.getByTestId('dropdown-field__name')).toHaveTextContent(
      'United States'
    );
    expect(screen.getByTestId('dropdown-field__value')).toHaveValue('US');
  });
  test('should hide dropdown when clicking outside', async () => {
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: '',
        },
      });
      return (
        <DropdownField
          name="testing"
          placeholder="Country"
          control={control}
          items={[
            { code: 'SE', name: 'Sweden' },
            { code: 'US', name: 'United States' },
          ]}
          idSelector={(option) => option.code}
          textSelector={(option) => option.name}
        />
      );
    };
    render(<Component />);
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));
    expect(screen.getByTestId('dropdown-field__list')).toHaveClass(
      'scale-y-100 opacity-100'
    );
    await userEvent.click(document.body);

    expect(screen.getByTestId('dropdown-field__list')).not.toHaveClass(
      'scale-y-100 opacity-100'
    );
  });
  test('should be able to move up/move down/entering a dropdown field item', async () => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
    const Component = () => {
      const { control } = useForm<AddressFormData>({
        resolver: yupResolver(schemaAddress),
        defaultValues: {
          testing: 'SE',
        },
      });
      return (
        <DropdownField
          name="testing"
          placeholder="Country"
          control={control}
          items={[
            { code: 'SE', name: 'Sweden' },
            { code: 'US', name: 'United States' },
            { code: 'EN', name: 'England' },
          ]}
          idSelector={(option) => option.code}
          textSelector={(option) => option.name}
        />
      );
    };
    render(<Component />);
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));
    expect(screen.getByTestId('dropdown-field__list')).toHaveClass(
      'scale-y-100 opacity-100'
    );
    expect(screen.queryAllByTestId('dropdown-field__item')[0]).toHaveClass(
      'bg-secondary-3'
    );
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.queryAllByTestId('dropdown-field__item')[0]).not.toHaveClass(
      'bg-secondary-3'
    );
    expect(screen.queryAllByTestId('dropdown-field__item')[1]).toHaveClass(
      'bg-secondary-3'
    );
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.queryAllByTestId('dropdown-field__item')[1]).not.toHaveClass(
      'bg-secondary-3'
    );
    expect(screen.queryAllByTestId('dropdown-field__item')[2]).toHaveClass(
      'bg-secondary-3'
    );
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.queryAllByTestId('dropdown-field__item')[2]).not.toHaveClass(
      'bg-secondary-3'
    );
    expect(screen.queryAllByTestId('dropdown-field__item')[1]).toHaveClass(
      'bg-secondary-3'
    );
    await userEvent.keyboard('{Enter}');

    expect(screen.getByTestId('dropdown-field__list')).not.toHaveClass(
      'scale-y-100 opacity-100'
    );
  });
});
