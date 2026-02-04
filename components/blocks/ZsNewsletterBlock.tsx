import Newsletter from 'components/zitac/Newsletter';

function ZsNewsletterBlock() {
  const token = process.env.CUSTOBAR_COMPANY_TOKEN;

  if (!token) {
    console.error('Failed to retrieve token.');
    return <div>Failed to retrieve token. Please try again later.</div>;
  }

  return <Newsletter token={token} />;
}

export default ZsNewsletterBlock;
