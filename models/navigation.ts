export interface NavigationLink {
  name: string;
  url: string;
  selected?: boolean;
  links?: NavigationLink[];
}
export interface LinkFieldDefinition {
  text: string;
  url?: string;
}
