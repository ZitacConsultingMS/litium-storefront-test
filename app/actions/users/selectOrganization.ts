'use server';
import { AuthenticationFailureType } from 'models/authenticationFailureType';
import { redirect } from 'next/navigation';
import { selectOrganization } from 'services/organizationService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { getHost } from 'utils/headers';

/**
 * Select an user's organization.
 * @param redirectUrl an URL to redirect after signing in.
 * @param formData a select user organization form data.
 * @returns.
 */
export const selectUserOrganization = async function (
  redirectUrl: string,
  formData: FormData
): Promise<void> {
  try {
    await selectOrganization(formData.get('id'));
  } catch (error: any) {
    if (
      error[0]?.extensions?.code ===
      AuthenticationFailureType.AUTH_NOT_AUTHORIZED
    ) {
      const website = await getWebsite();
      const to = new URL(website.loginPageUrl, await getHost());
      redirect(to.href);
    } else {
      throw error;
    }
  }

  if (redirectUrl) {
    const to = new URL(redirectUrl, await getHost());
    redirect(to.href);
  }
};
