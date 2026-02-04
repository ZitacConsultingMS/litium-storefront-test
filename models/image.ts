export interface Image {
  url: string;
  dimension: {
    width?: number;
    height?: number;
    sizes?: string;
  };
}
