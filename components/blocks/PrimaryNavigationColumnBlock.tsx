import { Block } from 'models/block';
import BlockContainer from './BlockContainer';

/**
 * Renders a column block in Primary navigation.
 * @param children the children blocks.
 */
function PrimaryNavigationColumnBlock({ children }: { children: Block[] }) {
  return <BlockContainer blocks={children} className="m-5"></BlockContainer>;
}

export default PrimaryNavigationColumnBlock;
