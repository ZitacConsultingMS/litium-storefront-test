export interface Preview {
  scripts: PreviewFileItem[];
  styleSheets: PreviewFileItem[];
}

export interface PreviewFileItem {
  src: string;
  attributes?: PreviewFileItemAttribute[];
}

export interface PreviewFileItemAttribute {
  name: string;
  value: string;
}
