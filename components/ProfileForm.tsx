'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { updateProfile } from 'app/actions/updateProfile';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { FieldGroup } from 'models/field';
import { useContext, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  filterSupportedField,
  filterWritableFields,
  filterWritableOrNonEmptyFields,
  generateValidationSchema,
  getFieldValue,
  isEmpty,
} from 'services/formService';
import * as yup from 'yup';
import { Button } from './elements/Button';
import FieldContainer from './fields/FieldContainer';
import ErrorText from './form/ErrorText';

function ProfileForm({ value }: { value: FieldGroup[] }) {
  const t = useTranslations();
  const [profileFields, setProfileFields] = useState(value);
  const [errors, setErrors] = useState([]);
  let hasError = false;
  const websiteContext = useContext(WebsiteContext);
  const writableFields = filterWritableFields(profileFields);
  const writableOrNonEmptyFields =
    filterWritableOrNonEmptyFields(profileFields);
  const schemaProfile = generateValidationSchema(
    writableOrNonEmptyFields,
    websiteContext.culture.code
  );
  type ProfileFormData = yup.InferType<typeof schemaProfile>;
  const { handleSubmit, control, reset } = useForm<ProfileFormData>({
    resolver: yupResolver(schemaProfile),
    defaultValues: useMemo(() => {
      return getDefaultValue(writableOrNonEmptyFields);
    }, [writableOrNonEmptyFields]),
  });
  const onSubmit = async (data: any) => {
    setErrors([]);
    const result = await updateProfile(
      writableOrNonEmptyFields,
      websiteContext.culture.code,
      data
    );
    if (result?.errors) {
      setErrors(result.errors);
      hasError = true;
    }
    if (result?.person) {
      reset(
        getDefaultValue(
          filterWritableOrNonEmptyFields(
            filterSupportedField(result.person.fieldGroups)
          )
        )
      );
      setProfileFields(filterSupportedField(result.person.fieldGroups));
    }
  };
  const updateProfileForm = async (updateProfileHandler: any) => {
    try {
      await updateProfileHandler();
      return !hasError;
    } catch (error) {
      return false;
    }
  };

  return (
    <form
      className="mb-2 mt-3 flex w-full flex-col gap-3 lg:w-1/2 lg:min-w-[530px]"
      onSubmit={(e) => e.preventDefault()}
    >
      {profileFields &&
        profileFields.map((group: any) => {
          const { fieldGroupId, name, fields } = group;
          return (
            <div key={name || fieldGroupId}>
              <h3 className="font-bold">{name}</h3>
              <FieldContainer fields={fields} control={control} />
            </div>
          );
        })}
      {writableFields.length > 0 && (
        <Button
          type="submit"
          rounded={true}
          className="w-full border p-4 text-sm lg:w-1/2"
          data-testid="profile-form__save"
          successLabel={'myprofile.button.saved'}
          reactive={true}
          onClick={() => updateProfileForm(handleSubmit(onSubmit))}
        >
          {t('myprofile.button.save')}
        </Button>
      )}
      {!isEmpty(errors) && (
        <ErrorText errors={errors} className="py-2 text-base"></ErrorText>
      )}
    </form>
  );
}

function getDefaultValue(fields: any) {
  const data: any = {};
  for (let item of fields) {
    data[item.field] = getFieldValue(item);
  }
  return data;
}

export default ProfileForm;
