import { HtmlText } from 'components/elements/HtmlText';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import 'styles/zitac/faq.scss';

export interface ZsFAQType {
  zsFaqQuestion: string;
  zsFaqAnswer: string;
}

export interface ZsFAQField extends ContentFieldType {
  zsFAQ: ZsFAQType[];
}

interface ZsFAQBlockProps extends Block {
  fields: ZsFAQField;
  systemId: string;
}

export default function ZsFAQBlock(props: ZsFAQBlockProps) {
  const faqs = props.fields.zsFAQ;
  const sysId = props.systemId;

  if (!faqs[0]?.zsFaqQuestion || !faqs[0]?.zsFaqAnswer) {
    return <></>;
  }

  return (
    <section className="faq-container">
      {faqs.map((faq: ZsFAQType, i: number) => (
        <details
          key={`${sysId}-${i}`}
          className="faqWrapper group border-b border-gray-200 py-4 transition-all"
        >
          <summary className="question flex cursor-pointer items-center justify-between text-left text-gray-900">
            <span className="text-base font-medium">{faq.zsFaqQuestion}</span>
          </summary>

          <div className="collapsible-content overflow-hidden transition-all duration-300 ease-in-out group-open:mt-2 group-open:max-h-[1000px]">
            <HtmlText
              className="text-sm text-gray-600"
              innerHTML={faq.zsFaqAnswer}
              data-testid="text__editor"
            />
          </div>
        </details>
      ))}
    </section>
  );
}
