import Trustpilot from './Trustpilot';

interface TrustpilotProductProps {
  articleNumber: string;
  name: string | null;
}

export default function TrustpilotProduct({
  articleNumber,
  name,
}: TrustpilotProductProps) {
  return (
    <Trustpilot
      articleNumber={articleNumber}
      name={name}
      templateId="5763bccae0a06d08e809ecbb"
      businessUnitId="5c9007983267c100016bb106"
    />
  );
}
