import { Block } from 'models/block';
import BlockContainer from '../blocks/BlockContainer';

/**
 * Render a footer
 * @param props footer's column.
 * @returns
 */
const Footer = ({ blocks }: { blocks: Block[] }) => {
  return (
    <footer className="mt-7 border-t border-secondary-3 pt-10 print:hidden">
      <div className="container mx-auto flex flex-wrap justify-center px-5">
        <BlockContainer
          blocks={blocks}
          className="mb-9 basis-10/12 md:basis-5/12 lg:mb-4 lg:basis-1/5"
        ></BlockContainer>
      </div>
    </footer>
  );
};

export default Footer;
