export interface SearchMetaData {
  cursor: any;
  data: Data[];
}

export interface Data {
  __object_type: string;
  id: string;
}
