import clsx from 'clsx';
import { Block } from 'models/block';
import { getComponent } from 'services/blockService.server';

interface BlockContainerProps {
  /**
   * List of blocks in the container.
   */
  blocks: Block[];

  /**
   * When true, its first block's priority is set to true.
   * The purpose is to set first 3 block's images high priority and preload.
   */
  priority?: boolean;

  /**
   * A className string to set for each block's section.
   */
  className?: string;
}

/**
 * Represents a component to render a Block Container.
 * The component loops through the block list, looks up a block template
 * based on its `__typename` and uses it to render the blocks.
 * @param props a BlockContainerProps input param.
 * @returns
 */
export default function BlockContainer(props: BlockContainerProps) {
  return props.blocks && props.blocks.length > 0 ? (
    <>
      {props.blocks.map((block, index) => {
        const BlockComponent = getComponent(block.__typename);
        if (!BlockComponent) {
          return null;
        }
        return (
          <section
            data-litium-block-id={block.systemId}
            key={`block-${block.systemId}`}
            className={clsx(props.className)}
          >
            <BlockComponent
              priority={props.priority && index <= 3}
              {...block}
            ></BlockComponent>
          </section>
        );
      })}
    </>
  ) : (
    <></>
  );
}
