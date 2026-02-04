import PageLayout from 'components/layouts/PageLayout';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <PageLayout showNavigation={false}>{children}</PageLayout>;
}
