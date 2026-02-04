'use client';
import { selectUserOrganization } from 'app/actions/users/selectOrganization';
import { NavigationHistoryContext } from 'contexts/NavigationHistoryContext';
import { useTranslations } from 'hooks/useTranslations';
import { PersonOrganizationLink } from 'models/user';
import { usePathname, useSearchParams } from 'next/navigation';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './elements/Button';
import { Heading1 } from './elements/Heading';
import DropdownField from './form/DropdownField';

export const OrganizationSelect = ({
  items,
  value,
  myPagesPageUrl,
}: {
  items: PersonOrganizationLink[];
  value: string;
  myPagesPageUrl: string;
}) => {
  const { history } = useContext(NavigationHistoryContext);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const getReferrerUrl = () => {
    if (!history || history.length < 2) {
      return null;
    }
    return history[history.length - 2] !== pathname
      ? history[history.length - 2]
      : null;
  };
  const selectOrganizationAction = selectUserOrganization.bind(
    null,
    searchParams.get('redirectUrl') || getReferrerUrl() || myPagesPageUrl
  );
  const { control } = useForm<FormValues>({
    defaultValues: {
      id: value,
    },
  });

  return (
    <div data-testid="organization-select">
      <Heading1
        className="my-10 text-center"
        data-testid="select-organization-form__title"
      >
        {t('selectorganization.title')}
      </Heading1>
      <form
        className="flex w-full flex-col gap-5"
        action={selectOrganizationAction}
        data-testid="select-organization-form"
      >
        <DropdownField
          items={items}
          textSelector={(opt) => opt.organization.fields._nameInvariantCulture}
          control={control}
          name="id"
          placeholder={t('selectorganization.title')}
          idSelector={(opt) => opt.organization.id}
          dataTestId="select-organization-form__organization"
        />
        <Button
          fluid={true}
          rounded={true}
          type="submit"
          data-testid="select-organization-form__submit"
        >
          {t('selectorganization.submitbuttontext')}
        </Button>
      </form>
    </div>
  );
};

type FormValues = {
  id: string;
};
