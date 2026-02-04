import TrustpilotTopbar from 'components/zitac/TrustpilotTopbar';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import Check from '../icons/zitac/check';

interface ZsTopBarType {
  blockText: string;
}

interface ZsTopBarField extends ContentFieldType {
  zsUSP: ZsTopBarType[];
  zsTextEditor: string;
}

interface ZsTopBarBlockProps extends Block {
  fields: ZsTopBarField;
}

export default function ZsTopBarBlock(props: ZsTopBarBlockProps) {
  const usps = props.fields.zsUSP;
  const texteditor = props.fields.zsTextEditor;
  return (
    <div className="relative flex h-[2.5rem] flex-wrap items-center justify-around py-2 md:h-auto md:justify-center md:px-5 md:min-h-[2.8rem] lg:justify-center xl:justify-between md:gap-y-2">
      <ul className="header-usp relative h-[calc(100%+1rem)] overflow-hidden text-center md:flex md:h-auto md:flex-wrap md:gap-x-12">
        {usps.map((usp, index) => (
          <li className="h-full w-auto" key={index}>
            <Check className="mr-2 inline-block size-5" />
            {usp.blockText}
          </li>
        ))}
      </ul>
      <div className="-mt-[12px] hidden md:mt-0 md:block">
        <TrustpilotTopbar theme="dark" />
      </div>
    </div>
  );
}
