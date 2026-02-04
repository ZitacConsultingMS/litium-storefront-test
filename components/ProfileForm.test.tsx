import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { updateProfile } from 'app/actions/updateProfile';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { FieldGroup } from 'models/field';
import { filterWritableOrNonEmptyFields } from 'services/formService';
import ProfileForm from './ProfileForm';

jest.mock('app/actions/updateProfile', () => ({
  updateProfile: jest.fn(),
}));

const renderComponent = (value: FieldGroup[]) =>
  render(
    <WebsiteContext.Provider value={{ ...EmptyWebsite }}>
      <ProfileForm value={value} />
    </WebsiteContext.Provider>
  );

const sampleFieldGroup = [
  {
    fieldGroupId: '1',
    name: 'Personal Information',
    fields: [
      {
        id: 'firstName',
        name: 'First Name',
        field: 'John',
        fieldMetadata: {
          inputField: 'ageInput',
          fieldType: 'Text',
          readable: true,
          writable: true,
          inputModel: '',
        },
        stringValue: 'ABC',
        __typename: 'StringValue',
      },
      {
        id: 'lastName',
        name: 'Last Name',
        field: 'Doe',
        fieldMetadata: {
          inputField: 'ageInput',
          fieldType: 'Text',
          readable: true,
          writable: true,
          inputModel: '',
        },
        stringValue: 'XYZ',
        __typename: 'StringValue',
      },
    ],
  },
];

describe('ProfileForm component', () => {
  test('should renders ProfileForm correctly', () => {
    renderComponent(sampleFieldGroup);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  test('should submits the form with correct data', async () => {
    (updateProfile as jest.Mock).mockResolvedValue({
      person: {
        fieldGroups: sampleFieldGroup,
      },
    });
    renderComponent(sampleFieldGroup);
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Jane' },
    });
    fireEvent.click(screen.getByText('myprofile.button.save'));

    await waitFor(() => {
      expect(updateProfile as jest.Mock).toHaveBeenCalledWith(
        filterWritableOrNonEmptyFields(sampleFieldGroup),
        'sv-SE',
        { Doe: 'XYZ', John: 'Jane' }
      );
    });
  });

  test('should handles validation errors', async () => {
    (updateProfile as jest.Mock).mockResolvedValue({
      errors: [{ message: 'Error occurred' }],
    });
    renderComponent(sampleFieldGroup);

    fireEvent.click(screen.getByTestId('profile-form__save'));
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });
});
