import Trustpilot from './Trustpilot';

interface TrustpilotFooterProps {
  theme?: string;
}

export default function TrustpilotFooter({
  theme = 'dark',
}: TrustpilotFooterProps) {
  return (
    <Trustpilot
      templateId="53aa8912dec7e10d38f59f36"
      businessUnitId="5c9007983267c100016bb106"
      styleHeight="140px"
      token="007d9492-77ba-4203-942d-f0fdafdd8c16"
      stars="1,2,3,4,5"
      reviewLanguages="se"
      theme={theme}
    />
  );
}
