import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { TextOption } from 'models/option';
import { PointerMediaImageItem } from 'models/pointers';
import 'styles/zitac/layoutBlock.scss';
import BlockContainer from './BlockContainer';

interface LayoutField extends ContentFieldType {
  zsBackgroundImage?: PointerMediaImageItem;
  zsBackgroundColor?: TextOption[];
  zsAlignItems?: TextOption[];
  zsColumnDistribution?: TextOption[];
  zsFullWidth?: Boolean;
  children: Block[];
}

interface LayoutBlockProps extends Block {
  fields: LayoutField;
}

export default function ZsLayoutTwoColumnsBlock(props: LayoutBlockProps) {
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
  let columnDistribution = props.fields.zsColumnDistribution?.[0].value;
  let fullWidthText;
  if (props.fields.zsFullWidth) {
    fullWidthText = 'full-width-text';
  } else {
    fullWidthText = 'auto-width-text';
  }

  // Map flex-based values to grid-based values
  const getGridClass = (flexValue: string) => {
    switch (flexValue) {
      case 'flex-75':
        return 'grid-75';
      case 'flex-66':
        return 'grid-66';
      case 'flex-50':
        return 'grid-50';
      case 'flex-33':
        return 'grid-33';
      case 'flex-25':
        return 'grid-25';
      default:
        return 'grid-50'; // Default to 50/50 split
    }
  };

  const gridClass = columnDistribution
    ? getGridClass(columnDistribution)
    : 'grid-50';

  return (
    <div
      className="layout-two-column relative left-1/2 w-screen -translate-x-2/4 py-10"
      style={styles()}
    >
      <div
        className={`mx-auto grid grid-cols-1 gap-8 px-5 md:container md:grid-cols-2 ${alignItems} md:${gridClass} ${fullWidthText}`}
      >
        <BlockContainer blocks={props.children || []}></BlockContainer>
      </div>
    </div>
  );
}
