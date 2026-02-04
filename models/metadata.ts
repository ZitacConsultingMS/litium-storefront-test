export interface Metadata {
  title: string;
  tags?: MetadataTagItem[];
  links?: MetadateLinkItem[];
}

export interface MetadataTagItem {
  content: string;
  name: string;
}

export interface MetadateLinkItem {
  href: string;
  attributes: MetadateLinkItemAttribute[];
}

export interface MetadateLinkItemAttribute {
  name: string;
  value: string;
}
