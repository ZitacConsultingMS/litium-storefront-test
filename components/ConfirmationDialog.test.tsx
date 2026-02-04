import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationDialog from './ConfirmationDialog';

describe('Confirmation dialog component', () => {
  test('Should not render dialog if visible flag is false', () => {
    render(
      <ConfirmationDialog
        visible={false}
        title={''}
        onAccept={() => {}}
        onCancel={() => {}}
      ></ConfirmationDialog>
    );
    expect(screen.queryByTestId('sidebar__backdrop')).not.toBeInTheDocument();
  });

  test('Should render dialog with correct data if visible flag is true', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title={'Confirmation dialog title'}
        message="Confirmation dialog message"
        onAccept={() => {}}
        onCancel={() => {}}
        btnOkTitle="Ok"
        btnCancelTitle="Cancel"
      ></ConfirmationDialog>
    );
    expect(screen.queryByTestId('sidebar__backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('confirmation-dialog__title')).toHaveTextContent(
      'Confirmation dialog title'
    );
    expect(
      screen.getByTestId('confirmation-dialog__message')
    ).toHaveTextContent('Confirmation dialog message');
    expect(
      screen.queryByTestId('confirmation-dialog__cancel-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('confirmation-dialog__cancel-button')
    ).toHaveTextContent('Cancel');
    expect(
      screen.queryByTestId('confirmation-dialog__ok-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('confirmation-dialog__ok-button')
    ).toHaveTextContent('Ok');
  });

  test('Should not render message if not available', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title={'Confirmation dialog title'}
        onAccept={() => {}}
        onCancel={() => {}}
      ></ConfirmationDialog>
    );
    expect(
      screen.queryByTestId('confirmation-dialog__message')
    ).not.toBeInTheDocument();
  });

  test('Should render cancel button with default title value if btnCancelTitle flag is not available', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title={'Confirmation dialog title'}
        onAccept={() => {}}
        onCancel={() => {}}
      ></ConfirmationDialog>
    );
    expect(
      screen.queryByTestId('confirmation-dialog__cancel-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('confirmation-dialog__cancel-button')
    ).toHaveTextContent('confirmation.button.no');
  });

  test('Should render Ok button with default title value if btnOkTitle flag is not available', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title={'Confirmation dialog title'}
        onAccept={() => {}}
        onCancel={() => {}}
      ></ConfirmationDialog>
    );
    expect(
      screen.queryByTestId('confirmation-dialog__ok-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('confirmation-dialog__ok-button')
    ).toHaveTextContent('confirmation.button.yes');
  });

  test('Should call onAccept function after clicking on Ok button', async () => {
    const onAccept = jest.fn();
    render(
      <ConfirmationDialog
        visible={true}
        title={'Confirmation dialog title'}
        onAccept={onAccept}
        onCancel={() => {}}
      ></ConfirmationDialog>
    );
    await userEvent.click(screen.getByTestId('confirmation-dialog__ok-button'));
    expect(onAccept).toHaveBeenCalled();
  });

  test('Should call onCancel function after clicking on cancel button', async () => {
    const onCancel = jest.fn();
    render(
      <ConfirmationDialog
        visible={true}
        title={'Confirmation dialog title'}
        onAccept={() => {}}
        onCancel={onCancel}
      ></ConfirmationDialog>
    );
    await userEvent.click(
      screen.getByTestId('confirmation-dialog__cancel-button')
    );
    expect(onCancel).toHaveBeenCalled();
  });
});
