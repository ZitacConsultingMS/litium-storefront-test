import getAccessToken from 'services/zitac/pinmeto';
import StoreInformationComponent from './StoreInformationComponent';

export default async function StoreInformationContent({ id, name }: { id: any; name?: string }) {
  const ACCOUNT_ID = process.env.PINMETO_ACCOUNT_ID;
  const GOOGLEMAPS_API_KEY = (process.env.GOOGLEMAPS_API_KEY || '') as string;
  const ACCESS_TOKEN = await getAccessToken();
  const response = await fetch(
    `https://api.pinmeto.com/v2/${ACCOUNT_ID}/locations/${id}`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );
  const { data: store } = await response.json();

  if (!response.ok) {
    return 'There was an error when fetching data.';
  }

  return (
    <>
      <StoreInformationComponent
        googleMapsApiKey={GOOGLEMAPS_API_KEY}
        store={store}
        name={name}
      />
    </>
  );
}
