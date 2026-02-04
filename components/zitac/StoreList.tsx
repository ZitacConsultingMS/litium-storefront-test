import getAccessToken from 'services/zitac/pinmeto';
import StoreListComponent from './StoreListComponent';
import MapComponent from './StoreListMap';

export default async function StoreList() {
  const ACCOUNT_ID = process.env.PINMETO_ACCOUNT_ID;
  const ACCESS_TOKEN = await getAccessToken();

  const res = await fetch(
    `https://api.pinmeto.com/v2/${ACCOUNT_ID}/locations`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return <p>There was an error when fetching data.</p>;

  const { data: stores } = await res.json();
  const GOOGLE_KEY = process.env.GOOGLEMAPS_API_KEY;
  if (!GOOGLE_KEY) throw new Error('Missing Google Maps API Key');

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <div className="order-2 w-full overflow-hidden rounded lg:order-1 lg:w-2/3">
        <MapComponent apiKey={GOOGLE_KEY} stores={stores} />
      </div>
      <div className="order-1 w-full space-y-4 lg:order-2 lg:w-1/3">
        <StoreListComponent stores={stores} />
      </div>
    </div>
  );
}
