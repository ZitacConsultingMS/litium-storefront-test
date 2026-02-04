import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { TextOption } from 'models/option';
import { PointerMediaImageItem } from 'models/pointers';
import 'styles/zitac/layoutBlock.scss';
import BlockContainer from './BlockContainer';

interface LayoutField extends ContentFieldType {
  zsBackgroundImage?: PointerMediaImageItem;
  zsBackgroundColor?: TextOption[];
  children?: Block[];
}

interface LayoutBlockProps extends Block {
  fields: LayoutField;
}

export default function ZsLayoutFullWidthBlock(props: LayoutBlockProps) {
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

  return (
    <div
      className="layout-full-width relative left-1/2 w-screen -translate-x-2/4"
      style={styles()}
    >
      <div className="mx-auto">
        <BlockContainer blocks={props.children || []}></BlockContainer>
      </div>
    </div>
  );
}
