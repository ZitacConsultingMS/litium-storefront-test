import {
  formatDecimalValue,
  generateValidationSchema,
} from 'services/formService';
import { updateProfilePerson } from 'services/userService.server';
import { updateProfile } from './updateProfile';

jest.mock('services/formService', () => ({
  formatDecimalValue: jest.fn(),
  generateValidationSchema: jest.fn().mockReturnValue({
    validate: jest.fn(),
  }),
}));

jest.mock('services/userService.server', () => ({
  updateProfilePerson: jest.fn(),
}));

describe('updateProfile function', () => {
  const mockFields = [
    {
      field: 'age',
      fieldMetadata: {
        inputField: 'ageInput',
        fieldType: 'Int',
        readable: true,
        writable: true,
        inputModel: '',
      },
      id: '1',
      name: 'Age',
      __typename: '',
    },
    {
      field: 'salary',
      fieldMetadata: {
        inputField: 'salaryInput',
        fieldType: 'Decimal',
        readable: true,
        writable: true,
        inputModel: '',
      },
      id: '2',
      name: 'Salary',
      __typename: '',
    },
  ];
  const mockCultureCode = 'en-US';
  const mockData = { age: '30', salary: '5000.75' };

  test('should validate data and update profile', async () => {
    const mockValidationSchema = {
      validate: jest.fn().mockResolvedValue(true),
    };
    (generateValidationSchema as jest.Mock).mockReturnValue(
      mockValidationSchema
    );
    (formatDecimalValue as jest.Mock).mockReturnValue('5000.75');
    (updateProfilePerson as jest.Mock).mockResolvedValue({ success: true });

    const result = await updateProfile(mockFields, mockCultureCode, mockData);

    expect(generateValidationSchema).toHaveBeenCalledWith(
      mockFields,
      mockCultureCode
    );
    expect(mockValidationSchema.validate).toHaveBeenCalledWith(mockData);
    expect(updateProfilePerson).toHaveBeenCalledWith({
      items: [
        { ageInput: { id: '1', value: 30 } },
        { salaryInput: { id: '2', value: '5000.75' } },
      ],
    });
    expect(result).toEqual({ success: true });
  });

  test('should return error if validation fails', async () => {
    const mockError = new Error('Validation failed');
    const mockValidationSchema = {
      validate: jest.fn().mockRejectedValue(mockError),
    };
    (generateValidationSchema as jest.Mock).mockReturnValue(
      mockValidationSchema
    );

    const result = await updateProfile(mockFields, mockCultureCode, mockData);

    expect(result).toEqual({ errors: mockError });
  });
});
