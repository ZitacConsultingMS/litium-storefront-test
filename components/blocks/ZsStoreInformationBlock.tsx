import StoreInformationContent from 'components/zitac/StoreInformation';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { Suspense } from 'react';
import { LoadingFallback } from './ZsLoadingFallback';

interface StoreInformation extends ContentFieldType {
  zsStoreID: string;
}

interface StoreInformationBlockProps extends Block {
  fields: StoreInformation;
}

export default function ZsStoreInformationBlock(
  props: StoreInformationBlockProps
) {
  const { zsStoreID, _name } = props.fields;

  return (
    <Suspense key={zsStoreID} fallback={<LoadingFallback />}>
      <StoreInformationContent id={zsStoreID} name={_name} />
    </Suspense>
  );
}
