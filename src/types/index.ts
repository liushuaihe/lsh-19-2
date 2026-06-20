export interface Product {
  id: string;
  name: string;
  description: string;
  salePrice: number;
  targetMarginRate: number;
  createdAt: number;
  updatedAt: number;
}

export interface IngredientNode {
  id: string;
  productId: string;
  parentId: string | null;
  name: string;
  quantity: number;
  unit: string;
  materialId: string | null;
  isLeaf: boolean;
  sortOrder: number;
}

export interface Material {
  id: string;
  name: string;
  defaultUnit: string;
  unitPrice: number;
  category: string;
  priceUpdatedAt: number;
}

export interface UnitConversion {
  id: string;
  fromUnit: string;
  toUnit: string;
  factor: number;
}

export interface PriceLog {
  id: string;
  materialId: string;
  oldPrice: number;
  newPrice: number;
  changedAt: number;
}

export interface CostNode {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  isLeaf: boolean;
  children: CostNode[];
  materialId: string | null;
  affected?: boolean;
}
