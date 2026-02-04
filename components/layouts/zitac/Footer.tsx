import TrustpilotFooter from 'components/zitac/TrustpilotFooter';
import { Block } from 'models/block';
import 'styles/zitac/footer.scss';
import BlockContainer from '../../blocks/BlockContainer';

/**
 * Render a footer
 * @param props footer's column.
 * @returns
 */
const Footer = ({ blocks }: { blocks: Block[] }) => {
  const [firstBlock, ...remainingBlocks] = blocks;

  return (
    <footer className="af:bg-af-bluegreen bg-seasea-blue pb-12 pt-10 text-secondary">
      <div className="mt-5">
        <div className="container mx-auto flex flex-wrap justify-between">
          <div className="basis-full md:basis-1/2">
            <BlockContainer blocks={[firstBlock]} />
          </div>
          <div className="flex basis-full md:basis-1/2">
            <BlockContainer className="!flex-[100%]" blocks={remainingBlocks} />
          </div>
          <div className="m-auto mt-10">
            <TrustpilotFooter />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
