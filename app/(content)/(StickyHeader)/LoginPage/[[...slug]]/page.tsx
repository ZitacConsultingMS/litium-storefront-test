import Login from 'components/Login';
import { OrganizationSelect } from 'components/OrganizationSelect';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createMetadataFromUrl } from 'services/metadataService.server';
import { get as getUserOrganization } from 'services/userService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { Token } from 'utils/constants';
import { AuthenticationFailureType } from '../../../../../models/authenticationFailureType';

export default async function Page(props: { searchParams?: Promise<any> }) {
  const searchParams = await props.searchParams;
  const token = (await cookies()).get(Token.Name)?.value;
  const myPagesPageUrl = (await getWebsite()).myPagesPageUrl;

  if (!token) {
    return <Login myPagesPageUrl={myPagesPageUrl} />;
  }
  let currentUser;
  try {
    currentUser = await getUserOrganization();
  } catch (error: any) {
    if (
      error[0].extensions?.code ===
      AuthenticationFailureType.AUTH_NOT_AUTHORIZED
    ) {
      return <Login myPagesPageUrl={myPagesPageUrl} />;
    } else {
      throw error;
    }
  }
  if (
    !currentUser?.person ||
    currentUser.person.organizations?.totalCount < 2
  ) {
    redirect(searchParams?.redirectUrl ?? myPagesPageUrl);
  }

  return (
    <OrganizationSelect
      value={currentUser.selectedOrganization?.organization.id || ''}
      items={currentUser.person.organizations.nodes}
      myPagesPageUrl={myPagesPageUrl}
    />
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  return await createMetadataFromUrl(params.slug?.join('/'));
}
