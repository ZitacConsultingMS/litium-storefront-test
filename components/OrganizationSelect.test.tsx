import { render, screen } from '@testing-library/react';
import { generateOrganizationLinks } from '__mock__/generateMockData';
import React from 'react';
import { OrganizationSelect } from './OrganizationSelect';

const mockRedirect = jest.fn();

jest.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
  usePathname: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams('q=tops')),
}));
jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  useActionState: jest.fn().mockReturnValue([{}, jest.fn()]),
}));
jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));
jest.mock('app/actions/users/selectOrganization', () => ({
  selectUserOrganization: jest.fn(),
}));

describe('OrganizationSelect component', () => {
  test('should render organization select form correctly', () => {
    const organizations = generateOrganizationLinks(2);
    render(
      <OrganizationSelect
        items={organizations}
        value={organizations[0].organization.id}
        myPagesPageUrl="/man"
      />
    );
    const items = screen.queryAllByTestId('dropdown-field__item');

    expect(
      screen.getByTestId('select-organization-form__organization')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('select-organization-form__title')
    ).toHaveTextContent('selectorganization.title');
    expect(
      screen.getByTestId('select-organization-form__submit')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('select-organization-form__organization')
    ).toHaveValue(organizations[0].organization.id);
    expect(screen.getByTestId('dropdown-field__name').textContent).toEqual(
      'Organization 0'
    );
    expect(items[0].textContent).toEqual('Organization 0');
    expect(items[1].textContent).toEqual('Organization 1');
  });
});
