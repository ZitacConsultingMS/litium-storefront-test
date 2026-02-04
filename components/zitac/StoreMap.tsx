'use client';

type StoreMapProps = {
  apiKey: string;
  placeId: string;
};

function StoreMap({ apiKey, placeId }: StoreMapProps) {
  return (
    <div className="overflow-hidden rounded">
      <iframe
        width="100%"
        height="450"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/place?q=place_id:${placeId}&key=${apiKey}`}
      ></iframe>
    </div>
  );
}

export default StoreMap;
