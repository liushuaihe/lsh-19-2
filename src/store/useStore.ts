import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Product,
  IngredientNode,
  Material,
  UnitConversion,
  PriceLog,
} from "@/types";
import { DEFAULT_CONVERSIONS } from "@/utils/unitConversion";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface AppState {
  products: Product[];
  nodes: IngredientNode[];
  materials: Material[];
  conversions: UnitConversion[];
  priceLogs: PriceLog[];
  selectedProductId: string | null;
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  affectedNodeIds: string[];

  selectProduct: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  toggleNode: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  setAffectedNodes: (ids: string[]) => void;
  clearAffected: () => void;

  addProduct: (name: string, description?: string) => Product;
  updateProduct: (id: string, data: Partial<Pick<Product, "name" | "description" | "salePrice" | "targetMarginRate">>) => void;
  deleteProduct: (id: string) => void;

  addIngredientNode: (
    productId: string,
    parentId: string | null,
    data: Partial<Pick<IngredientNode, "name" | "quantity" | "unit" | "materialId" | "isLeaf">>
  ) => IngredientNode;
  updateIngredientNode: (
    id: string,
    data: Partial<Pick<IngredientNode, "name" | "quantity" | "unit" | "materialId" | "isLeaf">>
  ) => void;
  deleteIngredientNode: (id: string) => void;
  convertToComposite: (id: string) => void;

  addMaterial: (
    name: string,
    defaultUnit: string,
    unitPrice: number,
    category?: string
  ) => Material;
  updateMaterial: (
    id: string,
    data: Partial<Pick<Material, "name" | "defaultUnit" | "unitPrice" | "category">>
  ) => void;
  deleteMaterial: (id: string) => void;

  addConversion: (fromUnit: string, toUnit: string, factor: number) => UnitConversion;
  updateConversion: (id: string, data: Partial<Pick<UnitConversion, "fromUnit" | "toUnit" | "factor">>) => void;
  deleteConversion: (id: string) => void;
}

const DEMO_MATERIALS: Omit<Material, "id">[] = [
  { name: "高筋面粉", defaultUnit: "kg", unitPrice: 5.5, category: "粉类", priceUpdatedAt: Date.now() },
  { name: "水", defaultUnit: "L", unitPrice: 0.01, category: "液体", priceUpdatedAt: Date.now() },
  { name: "盐", defaultUnit: "kg", unitPrice: 3.0, category: "调味料", priceUpdatedAt: Date.now() },
  { name: "牛腩", defaultUnit: "kg", unitPrice: 65.0, category: "肉类", priceUpdatedAt: Date.now() },
  { name: "酱油", defaultUnit: "L", unitPrice: 12.0, category: "调味料", priceUpdatedAt: Date.now() },
  { name: "姜", defaultUnit: "kg", unitPrice: 15.0, category: "蔬菜", priceUpdatedAt: Date.now() },
  { name: "葱", defaultUnit: "kg", unitPrice: 8.0, category: "蔬菜", priceUpdatedAt: Date.now() },
  { name: "八角", defaultUnit: "kg", unitPrice: 80.0, category: "香料", priceUpdatedAt: Date.now() },
  { name: "食用油", defaultUnit: "L", unitPrice: 14.0, category: "油脂", priceUpdatedAt: Date.now() },
  { name: "小白菜", defaultUnit: "kg", unitPrice: 6.0, category: "蔬菜", priceUpdatedAt: Date.now() },
  { name: "鸡蛋", defaultUnit: "个", unitPrice: 1.2, category: "蛋类", priceUpdatedAt: Date.now() },
];

function buildDemoData() {
  const materials = DEMO_MATERIALS.map((m) => ({ ...m, id: genId() }));
  const flour = materials[0];
  const water = materials[1];
  const salt = materials[2];
  const beef = materials[3];
  const soySauce = materials[4];
  const ginger = materials[5];
  const scallion = materials[6];
  const starAnise = materials[7];
  const oil = materials[8];
  const bokChoy = materials[9];
  const egg = materials[10];

  const conversions = DEFAULT_CONVERSIONS.map((c) => ({ ...c, id: genId() }));

  const productId = genId();
  const rootNodeId = genId();
  const doughId = genId();
  const noodleId = genId();
  const brothId = genId();
  const garnishId = genId();
  const flourNodeId = genId();
  const waterNodeId = genId();
  const saltForDoughId = genId();
  const saltForNoodleId = genId();
  const waterForNoodleId = genId();
  const beefNodeId = genId();
  const soySauceNodeId = genId();
  const gingerNodeId = genId();
  const scallionNodeId = genId();
  const starAniseNodeId = genId();
  const oilNodeId = genId();
  const bokChoyNodeId = genId();
  const eggNodeId = genId();

  const nodes: IngredientNode[] = [
    { id: rootNodeId, productId, parentId: null, name: "红烧牛肉面", quantity: 1, unit: "碗", materialId: null, isLeaf: false, sortOrder: 0 },
    { id: noodleId, productId, parentId: rootNodeId, name: "面条", quantity: 1, unit: "份", materialId: null, isLeaf: false, sortOrder: 0 },
    { id: brothId, productId, parentId: rootNodeId, name: "牛肉汤底", quantity: 1, unit: "份", materialId: null, isLeaf: false, sortOrder: 1 },
    { id: garnishId, productId, parentId: rootNodeId, name: "配菜", quantity: 1, unit: "份", materialId: null, isLeaf: false, sortOrder: 2 },
    { id: doughId, productId, parentId: noodleId, name: "面团", quantity: 1, unit: "份", materialId: null, isLeaf: false, sortOrder: 0 },
    { id: saltForNoodleId, productId, parentId: noodleId, name: "盐", quantity: 0.005, unit: "kg", materialId: salt.id, isLeaf: true, sortOrder: 1 },
    { id: waterForNoodleId, productId, parentId: noodleId, name: "水", quantity: 0.05, unit: "L", materialId: water.id, isLeaf: true, sortOrder: 2 },
    { id: flourNodeId, productId, parentId: doughId, name: "高筋面粉", quantity: 0.3, unit: "kg", materialId: flour.id, isLeaf: true, sortOrder: 0 },
    { id: waterNodeId, productId, parentId: doughId, name: "水", quantity: 0.15, unit: "L", materialId: water.id, isLeaf: true, sortOrder: 1 },
    { id: saltForDoughId, productId, parentId: doughId, name: "盐", quantity: 0.003, unit: "kg", materialId: salt.id, isLeaf: true, sortOrder: 2 },
    { id: beefNodeId, productId, parentId: brothId, name: "牛腩", quantity: 0.2, unit: "kg", materialId: beef.id, isLeaf: true, sortOrder: 0 },
    { id: soySauceNodeId, productId, parentId: brothId, name: "酱油", quantity: 0.03, unit: "L", materialId: soySauce.id, isLeaf: true, sortOrder: 1 },
    { id: gingerNodeId, productId, parentId: brothId, name: "姜", quantity: 0.02, unit: "kg", materialId: ginger.id, isLeaf: true, sortOrder: 2 },
    { id: scallionNodeId, productId, parentId: brothId, name: "葱", quantity: 0.015, unit: "kg", materialId: scallion.id, isLeaf: true, sortOrder: 3 },
    { id: starAniseNodeId, productId, parentId: brothId, name: "八角", quantity: 0.002, unit: "kg", materialId: starAnise.id, isLeaf: true, sortOrder: 4 },
    { id: oilNodeId, productId, parentId: brothId, name: "食用油", quantity: 0.02, unit: "L", materialId: oil.id, isLeaf: true, sortOrder: 5 },
    { id: bokChoyNodeId, productId, parentId: garnishId, name: "小白菜", quantity: 0.05, unit: "kg", materialId: bokChoy.id, isLeaf: true, sortOrder: 0 },
    { id: eggNodeId, productId, parentId: garnishId, name: "鸡蛋", quantity: 1, unit: "个", materialId: egg.id, isLeaf: true, sortOrder: 1 },
  ];

  const products: Product[] = [
    { id: productId, name: "红烧牛肉面", description: "招牌牛肉面，汤浓面滑", salePrice: 35, targetMarginRate: 0.5, createdAt: Date.now(), updatedAt: Date.now() },
  ];

  return { products, nodes, materials, conversions, priceLogs: [] as PriceLog[] };
}

function deleteNodeRecursive(id: string, nodes: IngredientNode[]): IngredientNode[] {
  const children = nodes.filter((n) => n.parentId === id);
  let remaining = nodes.filter((n) => n.id !== id);
  for (const child of children) {
    remaining = deleteNodeRecursive(child.id, remaining);
  }
  return remaining;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const demo = buildDemoData();

      return {
        products: demo.products,
        nodes: demo.nodes,
        materials: demo.materials,
        conversions: demo.conversions,
        priceLogs: demo.priceLogs,
        selectedProductId: demo.products[0]?.id ?? null,
        selectedNodeId: null,
        expandedNodeIds: new Set([
          demo.nodes.find((n) => n.parentId === null)?.id ?? "",
        ]),
        affectedNodeIds: [],

        selectProduct: (id) =>
          set({ selectedProductId: id, selectedNodeId: null }),
        selectNode: (id) => set({ selectedNodeId: id }),
        toggleNode: (id) =>
          set((state) => {
            const next = new Set(state.expandedNodeIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { expandedNodeIds: next };
          }),
        expandNode: (id) =>
          set((state) => {
            const next = new Set(state.expandedNodeIds);
            next.add(id);
            return { expandedNodeIds: next };
          }),
        collapseNode: (id) =>
          set((state) => {
            const next = new Set(state.expandedNodeIds);
            next.delete(id);
            return { expandedNodeIds: next };
          }),
        setAffectedNodes: (ids) => set({ affectedNodeIds: ids }),
        clearAffected: () => set({ affectedNodeIds: [] }),

        addProduct: (name, description = "") => {
          const product: Product = {
            id: genId(),
            name,
            description,
            salePrice: 0,
            targetMarginRate: 0.5,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          const rootNode: IngredientNode = {
            id: genId(),
            productId: product.id,
            parentId: null,
            name,
            quantity: 1,
            unit: "份",
            materialId: null,
            isLeaf: false,
            sortOrder: 0,
          };
          set((state) => ({
            products: [...state.products, product],
            nodes: [...state.nodes, rootNode],
            selectedProductId: product.id,
            expandedNodeIds: new Set([rootNode.id]),
          }));
          return product;
        },
        updateProduct: (id, data) =>
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
            ),
          })),
        deleteProduct: (id) =>
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            nodes: state.nodes.filter((n) => n.productId !== id),
            selectedProductId:
              state.selectedProductId === id ? null : state.selectedProductId,
            selectedNodeId:
              state.nodes.find((n) => n.id === state.selectedNodeId)?.productId === id
                ? null
                : state.selectedNodeId,
          })),

        addIngredientNode: (productId, parentId, data) => {
          const siblings = get().nodes.filter(
            (n) => n.parentId === parentId && n.productId === productId
          );
          const node: IngredientNode = {
            id: genId(),
            productId,
            parentId,
            name: data.name ?? "新配料",
            quantity: data.quantity ?? 1,
            unit: data.unit ?? "kg",
            materialId: data.materialId ?? null,
            isLeaf: data.isLeaf ?? true,
            sortOrder: siblings.length,
          };
          set((state) => ({
            nodes: [...state.nodes, node],
          }));
          if (parentId) {
            const parent = get().nodes.find((n) => n.id === parentId);
            if (parent && parent.isLeaf) {
              get().convertToComposite(parentId);
            }
          }
          return node;
        },
        updateIngredientNode: (id, data) =>
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.id === id ? { ...n, ...data } : n
            ),
          })),
        deleteIngredientNode: (id) =>
          set((state) => {
            const node = state.nodes.find((n) => n.id === id);
            if (!node || node.parentId === null) return state;
            const remaining = deleteNodeRecursive(id, state.nodes);
            return {
              nodes: remaining,
              selectedNodeId:
                state.selectedNodeId === id ? null : state.selectedNodeId,
            };
          }),
        convertToComposite: (id) =>
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.id === id ? { ...n, isLeaf: false, materialId: null } : n
            ),
          })),

        addMaterial: (name, defaultUnit, unitPrice, category = "其他") => {
          const material: Material = {
            id: genId(),
            name,
            defaultUnit,
            unitPrice,
            category,
            priceUpdatedAt: Date.now(),
          };
          set((state) => ({
            materials: [...state.materials, material],
          }));
          return material;
        },
        updateMaterial: (id, data) =>
          set((state) => {
            const old = state.materials.find((m) => m.id === id);
            if (!old) return state;
            const updated = { ...old, ...data };
            if (data.unitPrice !== undefined && data.unitPrice !== old.unitPrice) {
              updated.priceUpdatedAt = Date.now();
              const log: PriceLog = {
                id: genId(),
                materialId: id,
                oldPrice: old.unitPrice,
                newPrice: data.unitPrice,
                changedAt: Date.now(),
              };
              return {
                materials: state.materials.map((m) =>
                  m.id === id ? updated : m
                ),
                priceLogs: [log, ...state.priceLogs],
              };
            }
            return {
              materials: state.materials.map((m) =>
                m.id === id ? updated : m
              ),
            };
          }),
        deleteMaterial: (id) =>
          set((state) => ({
            materials: state.materials.filter((m) => m.id !== id),
            nodes: state.nodes.map((n) =>
              n.materialId === id ? { ...n, materialId: null } : n
            ),
          })),

        addConversion: (fromUnit, toUnit, factor) => {
          const conversion: UnitConversion = {
            id: genId(),
            fromUnit,
            toUnit,
            factor,
          };
          set((state) => ({
            conversions: [...state.conversions, conversion],
          }));
          return conversion;
        },
        updateConversion: (id, data) =>
          set((state) => ({
            conversions: state.conversions.map((c) =>
              c.id === id ? { ...c, ...data } : c
            ),
          })),
        deleteConversion: (id) =>
          set((state) => ({
            conversions: state.conversions.filter((c) => c.id !== id),
          })),
      };
    },
    {
      name: "golden-abacus-storage",
      partialize: (state) => ({
        products: state.products,
        nodes: state.nodes,
        materials: state.materials,
        conversions: state.conversions,
        priceLogs: state.priceLogs,
        selectedProductId: state.selectedProductId,
        expandedNodeIds: Array.from(state.expandedNodeIds),
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState> & { expandedNodeIds?: string[] };
        return {
          ...current,
          ...p,
          expandedNodeIds: new Set(p.expandedNodeIds ?? []),
        };
      },
    }
  )
);
