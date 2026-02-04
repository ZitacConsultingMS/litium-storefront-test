import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { TextOption } from 'models/option';
import { PointerMediaImageItem } from 'models/pointers';
import BlockContainer from './BlockContainer';

interface LayoutField extends ContentFieldType {
  zsBackgroundImage?: PointerMediaImageItem;
  zsBackgroundColor?: TextOption[];
  zsAlignItems?: TextOption[];
  children: Block[];
}

interface LayoutBlockProps extends Block {
  fields: LayoutField;
}

export default function ZsLayoutFourColumnsBlock(props: LayoutBlockProps) {
  const background = {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundColor: props.fields.zsBackgroundColor?.[0].value,
  };
  let backgroundImage = {};
  if (props.fields.zsBackgroundImage?.item?.url) {
    backgroundImage = {
      backgroundImage: `url(${props.fields.zsBackgroundImage?.item?.url})`,
    };
  }

  const styles = () => {
    return { ...background, ...backgroundImage };
  };

  let alignItems = props.fields.zsAlignItems?.[0].value;

  return (
    <div
      className="relative left-1/2 w-screen -translate-x-2/4 py-10"
      style={styles()}
    >
      <div
        className={`${alignItems} mx-auto grid grid-cols-1 items-start gap-8 px-5 md:container md:grid-cols-2 lg:grid-cols-4`}
      >
        <BlockContainer blocks={props.children || []}></BlockContainer>
      </div>
    </div>
  );
}
