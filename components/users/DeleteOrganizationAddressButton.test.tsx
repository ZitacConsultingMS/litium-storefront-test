import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTranslations } from 'hooks/useTranslations';
import { useRouter } from 'next/navigation';
import { deleteOrganizationAddress } from 'services/organizationService.client';
import DeleteOrganizationAddressButton from './DeleteOrganizationAddressButton';

jest.mock('services/organizationService.client');
jest.mock('next/navigation');
jest.mock('hooks/useTranslations');

describe('DeleteOrganizationAddressButton', () => {
  const mockDeleteOrganizationAddress = deleteOrganizationAddress as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseTranslations = useTranslations as jest.Mock;

  beforeEach(() => {
    mockDeleteOrganizationAddress.mockReset();
    mockUseRouter.mockReturnValue({ refresh: jest.fn() });
    mockUseTranslations.mockReturnValue((key: string) => key);
  });

  test('renders the delete button', () => {
    render(<DeleteOrganizationAddressButton id="123" />);
    expect(screen.getByTestId('delete-address-button')).toBeInTheDocument();
  });

  test('shows the confirmation dialog when the delete button is clicked', () => {
    render(<DeleteOrganizationAddressButton id="123" />);
    fireEvent.click(screen.getByTestId('delete-address-button'));
    expect(
      screen.getByText('customeraddress.confirmation.title')
    ).toBeInTheDocument();
  });

  test('hides the confirmation dialog when cancel button is clicked', () => {
    render(<DeleteOrganizationAddressButton id="123" />);
    fireEvent.click(screen.getByTestId('delete-address-button'));
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /right-0/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /opacity-100/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /scale-x-100/i
    );
    fireEvent.click(screen.getByTestId('confirmation-dialog__cancel-button'));
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /-right-full/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /opacity-0/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /scale-x-0/i
    );
  });

  test('calls deleteCustomerAddress and refreshes the router when the accept button is clicked', async () => {
    const mockRefresh = jest.fn();
    mockUseRouter.mockReturnValue({ refresh: mockRefresh });
    mockDeleteOrganizationAddress.mockResolvedValue({});

    render(<DeleteOrganizationAddressButton id="123" />);

    fireEvent.click(screen.getByTestId('delete-address-button'));
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /right-0/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /opacity-100/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /scale-x-100/i
    );
    fireEvent.click(screen.getByTestId('confirmation-dialog__ok-button'));

    await waitFor(() => {
      expect(mockDeleteOrganizationAddress).toHaveBeenCalledWith('123');
      expect(mockRefresh).toHaveBeenCalled();
    });
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /-right-full/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /opacity-0/i
    );
    expect(screen.getByTestId('confirmation-dialog__container')).toHaveClass(
      /scale-x-0/i
    );
  });
});
