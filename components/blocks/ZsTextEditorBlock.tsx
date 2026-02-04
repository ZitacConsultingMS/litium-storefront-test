import { HtmlText } from 'components/elements/HtmlText';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';

interface ZsTextEditor extends ContentFieldType {
  zsTextEditor: string;
}

interface ZsTextEditorBlockProps extends Block {
  fields: ZsTextEditor;
}

export default function ZsTextEditorBlock(props: ZsTextEditorBlockProps) {
  const { zsTextEditor } = props.fields;
  return (
    <HtmlText
      className="texteditor-block min-w-full"
      innerHTML={zsTextEditor}
      data-testid="text__editor"
    ></HtmlText>
  );
}
