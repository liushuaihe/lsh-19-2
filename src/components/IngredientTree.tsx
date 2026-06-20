import { useStore } from "@/store/useStore";
import { calculateCost } from "@/utils/costEngine";
import { getConversionHint } from "@/utils/unitConversion";
import { CostNode } from "@/types";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Leaf,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNodeProps {
  costNode: CostNode;
  depth: number;
  affectedIds: string[];
}

function TreeNode({ costNode, depth, affectedIds }: TreeNodeProps) {
  const nodes = useStore((s) => s.nodes);
  const expandedNodeIds = useStore((s) => s.expandedNodeIds);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const toggleNode = useStore((s) => s.toggleNode);
  const selectNode = useStore((s) => s.selectNode);
  const addIngredientNode = useStore((s) => s.addIngredientNode);
  const deleteIngredientNode = useStore((s) => s.deleteIngredientNode);
  const expandNode = useStore((s) => s.expandNode);
  const materials = useStore((s) => s.materials);

  const isExpanded = expandedNodeIds.has(costNode.id);
  const isSelected = selectedNodeId === costNode.id;
  const isAffected = affectedIds.includes(costNode.id);
  const isRoot = depth === 0;
  const hasChildren = costNode.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(costNode.id);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === costNode.id);
    if (!node) return;

    const child = addIngredientNode(node.productId, costNode.id, {
      name: "新配料",
      quantity: 1,
      unit: "kg",
      isLeaf: true,
      materialId: null,
    });

    if (!isExpanded) {
      expandNode(costNode.id);
    }
    selectNode(child.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteIngredientNode(costNode.id);
  };

  const material = costNode.materialId
    ? materials.find((m) => m.id === costNode.materialId)
    : null;

  return (
    <div>
      <div
        onClick={() => selectNode(costNode.id)}
        className={`group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-150 ${
          isSelected
            ? "bg-gold-500/20 border border-gold-500/30"
            : isAffected
            ? "bg-danger/10 border border-danger/20 animate-pulse-gold"
            : "hover:bg-charcoal-700/50 border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        <button
          onClick={handleToggle}
          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${
            hasChildren || !costNode.isLeaf
              ? "text-gold-500 hover:text-gold-400"
              : "text-transparent"
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {costNode.isLeaf ? (
          <Leaf className="shrink-0 w-3.5 h-3.5 text-green-500/70" />
        ) : (
          <FolderOpen
            className={`shrink-0 w-3.5 h-3.5 ${
              isExpanded ? "text-gold-400" : "text-gold-600"
            }`}
          />
        )}

        <span
          className={`flex-1 text-sm truncate ${
            isSelected ? "text-gold-300 font-medium" : "text-charcoal-100"
          }`}
        >
          {costNode.name}
        </span>

        <span className="text-xs text-charcoal-300 shrink-0">
          {costNode.quantity}
          {costNode.unit}
        </span>

        {material && (
          <span className="text-xs text-charcoal-400 shrink-0">
            @{material.unitPrice}元/{material.defaultUnit}
          </span>
        )}

        <span
          className={`text-xs font-semibold shrink-0 min-w-[60px] text-right ${
            isAffected ? "text-danger-light" : "text-gold-400"
          }`}
        >
          ¥{costNode.cost.toFixed(2)}
        </span>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
          {!isRoot && (
            <button
              onClick={handleDelete}
              className="p-1 text-charcoal-400 hover:text-danger rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          {!costNode.isLeaf && (
            <button
              onClick={handleAddChild}
              className="p-1 text-charcoal-400 hover:text-gold-400 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && costNode.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {costNode.children.map((child) => (
              <TreeNode
                key={child.id}
                costNode={child}
                depth={depth + 1}
                affectedIds={affectedIds}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IngredientTree() {
  const selectedProductId = useStore((s) => s.selectedProductId);
  const nodes = useStore((s) => s.nodes);
  const materials = useStore((s) => s.materials);
  const conversions = useStore((s) => s.conversions);
  const affectedNodeIds = useStore((s) => s.affectedNodeIds);
  const addIngredientNode = useStore((s) => s.addIngredientNode);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectNode = useStore((s) => s.selectNode);

  if (!selectedProductId) {
    return (
      <div className="flex-1 flex items-center justify-center text-charcoal-400">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">🧮</div>
          <p className="text-lg">选择或创建一个产品开始配料核算</p>
        </div>
      </div>
    );
  }

  const rootNode = nodes.find(
    (n) => n.productId === selectedProductId && n.parentId === null
  );

  if (!rootNode) {
    return (
      <div className="flex-1 flex items-center justify-center text-charcoal-400">
        产品数据异常
      </div>
    );
  }

  const costTree = calculateCost(rootNode.id, nodes, materials, conversions);

  const handleAddRoot = () => {
    const child = addIngredientNode(selectedProductId, rootNode.id, {
      name: "新配料",
      quantity: 1,
      unit: "kg",
      isLeaf: true,
      materialId: null,
    });
    selectNode(child.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gold-900/20">
        <div>
          <h2 className="font-serif text-lg font-bold text-gold-400">
            {costTree.name}
          </h2>
          <p className="text-xs text-charcoal-300 mt-0.5">
            总成本:{" "}
            <span className="text-gold-300 font-semibold text-sm">
              ¥{costTree.cost.toFixed(2)}
            </span>
          </p>
        </div>
        <button
          onClick={handleAddRoot}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-600 hover:bg-gold-500 text-charcoal-900 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加配料
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <TreeNode
          costNode={costTree}
          depth={0}
          affectedIds={affectedNodeIds}
        />
      </div>

      {selectedNodeId && (
        <NodeDetailPanel />
      )}
    </div>
  );
}

function NodeDetailPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const nodes = useStore((s) => s.nodes);
  const materials = useStore((s) => s.materials);
  const conversions = useStore((s) => s.conversions);
  const updateIngredientNode = useStore((s) => s.updateIngredientNode);
  const addIngredientNode = useStore((s) => s.addIngredientNode);
  const expandNode = useStore((s) => s.expandNode);
  const commonUnits = [
    "kg", "g", "mg", "L", "mL", "个", "只", "条", "片", "根",
    "袋", "箱", "桶", "瓶", "包", "罐", "勺", "杯", "碗", "把",
    "斤", "两",
  ];

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const computedCost = calculateCost(node.id, nodes, materials, conversions);

  const isRoot = node.parentId === null;

  const material = node.materialId
    ? materials.find((m) => m.id === node.materialId)
    : null;

  const conversionHint =
    material && node.unit !== material.defaultUnit
      ? getConversionHint(node.unit, material.defaultUnit, conversions)
      : null;

  return (
    <div className="border-t border-gold-900/20 bg-charcoal-900/80 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-charcoal-300 mb-1">名称</label>
          <input
            type="text"
            value={node.name}
            onChange={(e) =>
              updateIngredientNode(node.id, { name: e.target.value })
            }
            className="w-full px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-sm text-charcoal-50 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-charcoal-300 mb-1">数量</label>
          <input
            type="number"
            step="any"
            value={node.quantity}
            onChange={(e) =>
              updateIngredientNode(node.id, {
                quantity: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-sm text-charcoal-50 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-charcoal-300 mb-1">单位</label>
          <select
            value={node.unit}
            onChange={(e) =>
              updateIngredientNode(node.id, { unit: e.target.value })
            }
            className="w-full px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-sm text-charcoal-50 focus:outline-none focus:border-gold-500 transition-colors"
          >
            {commonUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {node.isLeaf ? (
          <div>
            <label className="block text-xs text-charcoal-300 mb-1">
              关联原料
            </label>
            <select
              value={node.materialId ?? ""}
              onChange={(e) =>
                updateIngredientNode(node.id, {
                  materialId: e.target.value || null,
                })
              }
              className="w-full px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-sm text-charcoal-50 focus:outline-none focus:border-gold-500 transition-colors"
            >
              <option value="">未关联</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unitPrice}元/{m.defaultUnit})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-charcoal-300 mb-1">
              类型
            </label>
            <div className="px-2 py-1.5 bg-charcoal-700/50 border border-charcoal-600/50 rounded text-sm text-gold-400">
              半成品（自动计算）
            </div>
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-xs text-charcoal-300 mb-1">成本</label>
          <div className="px-3 py-2 bg-gold-500/10 border border-gold-500/20 rounded-lg">
            <span className="text-lg font-bold text-gold-400">
              ¥{computedCost.cost.toFixed(2)}
            </span>
          </div>
        </div>

        {conversionHint && (
          <div className="col-span-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-charcoal-700/50 border border-gold-700/20 rounded text-xs text-gold-400">
              <ArrowRight className="w-3 h-3 shrink-0" />
              换算: {conversionHint}
            </div>
          </div>
        )}

        {node.isLeaf && !isRoot && (
          <div className="col-span-2">
            <button
              onClick={() => {
                addIngredientNode(
                  node.productId,
                  node.id,
                  {
                    name: "子配料",
                    quantity: 1,
                    unit: "kg",
                    isLeaf: true,
                    materialId: null,
                  }
                );
                expandNode(node.id);
              }}
              className="w-full py-1.5 text-sm text-gold-500 hover:text-gold-400 border border-dashed border-gold-700/50 hover:border-gold-500/50 rounded-lg transition-colors"
            >
              转为半成品（添加子配料）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
