import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { PointerMediaImageItem } from 'models/pointers';
import Image from 'next/image';
import { getAbsoluteImageUrl } from 'services/imageService';

interface ZsImageField extends ContentFieldType {
  image?: PointerMediaImageItem;
}

interface ZsImageBlockProps extends Block {
  fields: ZsImageField;
}

export default function ZsImageBlock(props: ZsImageBlockProps) {
  if (props.fields.blockImagePointer) {
    const image = props.fields.blockImagePointer.item;
    const width = image.dimension.width;
    const height = image.dimension.height;
    const src = getAbsoluteImageUrl(props.fields.blockImagePointer.item);

    return (
      <Image
        className="image-block rounded-xl"
        src={src}
        alt={image?.alt || ''}
        height={height}
        width={width}
      />
    );
  } else {
    return <></>;
  }
}
