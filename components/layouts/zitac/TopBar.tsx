import { Block } from 'models/block';
import 'styles/zitac/header.scss';
import BlockContainer from '../../blocks/BlockContainer';

/**
 * Render a Topbar
 * @param props topbar.
 * @returns
 */
const TopBar = ({ blocks }: { blocks: Block[] }) => {
  return (
    <div className="topbar af:bg-af-orange af:text-primary bg-seasea-blue text-secondary">
      <div className="mx-5 md:container md:mx-auto">
        <BlockContainer blocks={blocks}></BlockContainer>
      </div>
    </div>
  );
};

export default TopBar;
