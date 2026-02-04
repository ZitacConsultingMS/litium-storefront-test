import { gql } from '@apollo/client';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { CreateUser } from 'components/zitac/CreateUser';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { getRuntimeConfig } from 'services/zitac/customerApiService';

export default async function Page({ params }: { params: any }) {
  const content = await getContent({ params });
  const myPagesPageUrl = (await getWebsite()).myPagesPageUrl;
  const custobarToken = process.env.CUSTOBAR_COMPANY_TOKEN;
  const serviceAccount = process.env.SERVICE_ACCOUNT;
  const getApiBaseUrl = await getRuntimeConfig();
  const buildUrl = new URL('/api/customer', getApiBaseUrl.apiBaseUrl);
  const customerApiUrl = buildUrl.toString();

  return (
    <>
      <Heading1 className="mb-6">{content.fields._name}</Heading1>
      <HtmlText innerHTML={content.fields.text} />

      <CreateUser
        myPagesPageUrl={myPagesPageUrl}
        custobarToken={custobarToken}
        serviceAccount={serviceAccount}
        customerApiUrl={customerApiUrl}
      />
    </>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const content = await getContent({ params });
  return createMetadata(content.metadata);
}

async function getContent({ params }: { params: any }) {
  return (
    await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/') ?? '/',
    })
  ).content;
}

const GET_CONTENT = gql`
  query GetContent {
    content {
      ... on CreateUserPage {
        ...Metadata
        fields {
          _name
          text
        }
      }
    }
  }
`;
