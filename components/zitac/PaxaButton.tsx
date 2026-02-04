import { Button } from 'components/elements/Button';
import { useTranslations } from 'hooks/useTranslations';

interface PaxaButtonProps {
  stockStatus?: number;
  onClick?: () => void;
}

const PaxaButton = ({ stockStatus, onClick }: PaxaButtonProps) => {
  const t = useTranslations();
  return (
    <Button
      className="paxa-button h-full"
      fluid={true}
      disabled={stockStatus == 0}
      title={t('zs.paxa')}
      onClick={onClick}
      data-testid="product-paxa"
      rounded={true}
    >
      {t('zs.paxa')}
    </Button>
  );
};

export default PaxaButton;
