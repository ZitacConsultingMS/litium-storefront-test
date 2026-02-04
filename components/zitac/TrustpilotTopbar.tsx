import Trustpilot from './Trustpilot';

interface TrustpilotTopbarProps {
  theme?: string;
}

export default function TrustpilotTopbar({ theme = 'dark' }: TrustpilotTopbarProps) {
  return (
    <Trustpilot
      templateId="5406e65db0d04a09e042d5fc"
      businessUnitId="5c9007983267c100016bb106"
      styleHeight="28px"
      token="a064145e-3a7f-4233-bc6b-c37deaaaf535"
      theme={theme}
    />
  );
}
