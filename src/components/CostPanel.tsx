import { useStore } from "@/store/useStore";
import { calculateProductCost, calculateCost } from "@/utils/costEngine";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Layers, AlertTriangle, DollarSign, Target, TrendingUp as ProfitIcon } from "lucide-react";

const COLORS = [
  "#D4A017",
  "#B8860B",
  "#E8B820",
  "#FFD040",
  "#9A7209",
  "#7C5D07",
  "#C41E3A",
  "#E8475F",
];

export default function CostPanel() {
  const selectedProductId = useStore((s) => s.selectedProductId);
  const products = useStore((s) => s.products);
  const nodes = useStore((s) => s.nodes);
  const materials = useStore((s) => s.materials);
  const conversions = useStore((s) => s.conversions);
  const affectedNodeIds = useStore((s) => s.affectedNodeIds);
  const updateProduct = useStore((s) => s.updateProduct);

  if (!selectedProductId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-charcoal-400 text-sm">选择产品查看成本详情</p>
      </div>
    );
  }

  const product = products.find((p) => p.id === selectedProductId);
  const costTree = calculateProductCost(
    selectedProductId,
    nodes,
    materials,
    conversions
  );

  const cost = costTree.cost;
  const salePrice = product?.salePrice ?? 0;
  const targetMarginRate = product?.targetMarginRate ?? 0;
  const grossProfit = salePrice - cost;
  const marginRate = salePrice > 0 ? grossProfit / salePrice : 0;
  const belowTarget = salePrice > 0 && marginRate < targetMarginRate;

  const pieData = costTree.children.map((child) => ({
    name: child.name,
    value: parseFloat(child.cost.toFixed(2)),
  }));

  const hasAffected = affectedNodeIds.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gold-900/20">
        <h3 className="font-serif text-sm font-semibold text-gold-500 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          成本聚合
        </h3>
      </div>

      <div className="p-4">
        <div className="text-center mb-4">
          <div className="text-xs text-charcoal-300 mb-1">总成本</div>
          <div
            className={`text-3xl font-bold font-serif ${
              hasAffected ? "text-danger-light" : "text-gold-400"
            } text-shadow-gold`}
          >
            ¥{cost.toFixed(2)}
          </div>
          <div className="text-xs text-charcoal-400 mt-1">
            {costTree.children.length} 个一级配料
          </div>
        </div>

        <div className="mb-4 p-3 bg-charcoal-800/50 rounded-lg border border-gold-900/20">
          <h4 className="text-xs font-semibold text-charcoal-300 flex items-center gap-1.5 mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            定价与毛利
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-charcoal-400">售价</span>
              </div>
              <input
                type="number"
                value={salePrice || ""}
                onChange={(e) =>
                  updateProduct(selectedProductId, {
                    salePrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-20 px-2 py-1 bg-charcoal-700 border border-charcoal-600 rounded text-xs text-charcoal-50 text-right focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-charcoal-400" />
                <span className="text-xs text-charcoal-400">目标毛利率</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={targetMarginRate || ""}
                onChange={(e) =>
                  updateProduct(selectedProductId, {
                    targetMarginRate: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.5"
                className="w-16 px-2 py-1 bg-charcoal-700 border border-charcoal-600 rounded text-xs text-charcoal-50 text-right focus:outline-none focus:border-gold-500"
              />
            </div>
            {salePrice > 0 && (
              <>
                <div className="pt-2 border-t border-charcoal-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ProfitIcon className="w-3 h-3 text-charcoal-400" />
                    <span className="text-xs text-charcoal-400">毛利额</span>
                  </div>
                  <span className={`text-sm font-semibold ${grossProfit >= 0 ? "text-success-light" : "text-danger-light"}`}>
                    ¥{grossProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-400">毛利率</span>
                  <div className="flex items-center gap-1">
                    {belowTarget && (
                      <AlertTriangle className="w-3.5 h-3.5 text-danger-light" />
                    )}
                    <span className={`text-sm font-semibold ${belowTarget ? "text-danger-light" : "text-success-light"}`}>
                      {(marginRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {belowTarget && (
                  <div className="mt-2 p-2 bg-danger/10 border border-danger/20 rounded">
                    <div className="flex items-center gap-1.5 text-danger-light text-xs font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      低于目标毛利率 {(targetMarginRate * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {pieData.length > 0 && pieData.some((d) => d.value > 0) && (
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `¥${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "#1E1A2C",
                    border: "1px solid rgba(212,160,23,0.3)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F5F0E8",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-charcoal-300 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            一级配料成本
          </h4>
          {costTree.children.map((child, idx) => {
            const pct =
              costTree.cost > 0
                ? ((child.cost / costTree.cost) * 100).toFixed(1)
                : "0.0";
            return (
              <div key={child.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: COLORS[idx % COLORS.length],
                  }}
                />
                <span className="flex-1 text-xs text-charcoal-100 truncate">
                  {child.name}
                </span>
                <span className="text-xs font-medium text-gold-400">
                  ¥{child.cost.toFixed(2)}
                </span>
                <span className="text-xs text-charcoal-400 w-10 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        {hasAffected && (
          <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-danger-light text-xs font-semibold mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              价格波动影响
            </div>
            <div className="text-xs text-charcoal-200">
              {affectedNodeIds.length} 个节点受影响
            </div>
          </div>
        )}
      </div>

      <NodeCostBreakdown />
    </div>
  );
}

function NodeCostBreakdown() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedProductId = useStore((s) => s.selectedProductId);
  const nodes = useStore((s) => s.nodes);
  const materials = useStore((s) => s.materials);
  const conversions = useStore((s) => s.conversions);

  if (!selectedNodeId || !selectedProductId) return null;

  const costNode = calculateCost(selectedNodeId, nodes, materials, conversions);
  if (!costNode || costNode.isLeaf) return null;

  return (
    <div className="p-4 border-t border-gold-900/20">
      <h4 className="text-xs font-semibold text-charcoal-300 mb-2">
        选中节点子配料明细
      </h4>
      <div className="space-y-1">
        {costNode.children.map((child) => (
          <div key={child.id} className="flex items-center justify-between text-xs">
            <span className="text-charcoal-200">{child.name}</span>
            <span className="text-gold-400">¥{child.cost.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-charcoal-700">
          <span className="text-charcoal-100 font-medium">合计</span>
          <span className="text-gold-300 font-semibold">
            ¥{costNode.cost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
