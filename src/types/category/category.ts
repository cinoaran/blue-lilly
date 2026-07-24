export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {products?: number};
  attributes?: Record<string, unknown> | null; // added
}
