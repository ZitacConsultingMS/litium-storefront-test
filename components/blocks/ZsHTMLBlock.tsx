import { HtmlText } from 'components/elements/HtmlText';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';

interface ZsHtmlBlock extends ContentFieldType {
  zsHTML: string;
}

interface ZsHtmlBlockProps extends Block {
  fields: ZsHtmlBlock;
}

export default function ZsHtmlBlock(props: ZsHtmlBlockProps) {
  const { zsHTML } = props.fields;
  return (
    <HtmlText
      className="min-w-full"
      innerHTML={zsHTML}
      data-testid="html__editor"
    ></HtmlText>
  );
}
