import type {
  IngredientNode,
  Material,
  UnitConversion,
  CostNode,
} from "@/types";
import { convertUnit } from "./unitConversion";

export function calculateCost(
  nodeId: string,
  nodes: IngredientNode[],
  materials: Material[],
  conversions: UnitConversion[]
): CostNode {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    return {
      id: nodeId,
      name: "未知",
      quantity: 0,
      unit: "",
      cost: 0,
      isLeaf: true,
      children: [],
      materialId: null,
    };
  }

  if (node.isLeaf && node.materialId) {
    const material = materials.find((m) => m.id === node.materialId);
    if (!material) {
      return {
        id: node.id,
        name: node.name,
        quantity: node.quantity,
        unit: node.unit,
        cost: 0,
        isLeaf: true,
        children: [],
        materialId: node.materialId,
      };
    }

    const convertedQty = convertUnit(
      node.quantity,
      node.unit,
      material.defaultUnit,
      conversions
    );
    const cost = material.unitPrice * convertedQty;

    return {
      id: node.id,
      name: node.name,
      quantity: node.quantity,
      unit: node.unit,
      cost,
      isLeaf: true,
      children: [],
      materialId: node.materialId,
    };
  }

  const childNodes = nodes
    .filter((n) => n.parentId === nodeId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const childCostNodes = childNodes.map((child) =>
    calculateCost(child.id, nodes, materials, conversions)
  );

  const totalCost = childCostNodes.reduce((sum, child) => sum + child.cost, 0);

  return {
    id: node.id,
    name: node.name,
    quantity: node.quantity,
    unit: node.unit,
    cost: totalCost,
    isLeaf: false,
    children: childCostNodes,
    materialId: node.materialId,
  };
}

export function calculateProductCost(
  productId: string,
  nodes: IngredientNode[],
  materials: Material[],
  conversions: UnitConversion[]
): CostNode {
  const rootNode = nodes.find(
    (n) => n.productId === productId && n.parentId === null
  );
  if (!rootNode) {
    return {
      id: "",
      name: "",
      quantity: 0,
      unit: "",
      cost: 0,
      isLeaf: false,
      children: [],
      materialId: null,
    };
  }
  return calculateCost(rootNode.id, nodes, materials, conversions);
}

export function findAffectedNodes(
  materialId: string,
  nodes: IngredientNode[]
): string[] {
  const leafNodes = nodes.filter(
    (n) => n.isLeaf && n.materialId === materialId
  );
  const affectedIds = new Set<string>();

  for (const leaf of leafNodes) {
    affectedIds.add(leaf.id);
    let current = leaf;
    while (current.parentId) {
      affectedIds.add(current.parentId);
      current = nodes.find((n) => n.id === current.parentId)!;
      if (!current) break;
    }
  }

  return Array.from(affectedIds);
}

export function findAffectedProducts(
  materialId: string,
  nodes: IngredientNode[]
): string[] {
  const affectedNodeIds = findAffectedNodes(materialId, nodes);
  const productIds = new Set<string>();

  for (const nodeId of affectedNodeIds) {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) productIds.add(node.productId);
  }

  return Array.from(productIds);
}

export function markAffected(
  costNode: CostNode,
  affectedIds: string[]
): CostNode {
  return {
    ...costNode,
    affected: affectedIds.includes(costNode.id),
    children: costNode.children.map((child) => markAffected(child, affectedIds)),
  };
}
