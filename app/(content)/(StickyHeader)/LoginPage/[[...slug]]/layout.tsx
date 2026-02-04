export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <div className="m-auto w-full lg:w-1/3">{children}</div>;
}
