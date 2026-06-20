import { useStore } from "@/store/useStore";
import { findAffectedProducts, findAffectedNodes } from "@/utils/costEngine";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function MaterialsPage() {
  const materials = useStore((s) => s.materials);
  const nodes = useStore((s) => s.nodes);
  const priceLogs = useStore((s) => s.priceLogs);
  const addMaterial = useStore((s) => s.addMaterial);
  const updateMaterial = useStore((s) => s.updateMaterial);
  const deleteMaterial = useStore((s) => s.deleteMaterial);
  const setAffectedNodes = useStore((s) => s.setAffectedNodes);

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("其他");

  const categories = useMemo(() => {
    const cats = new Set(materials.map((m) => m.category));
    return Array.from(cats);
  }, [materials]);

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim() || !newPrice) return;
    addMaterial(newName.trim(), newUnit, parseFloat(newPrice), newCategory);
    setNewName("");
    setNewUnit("kg");
    setNewPrice("");
    setNewCategory("其他");
    setShowAdd(false);
  };

  const handlePriceUpdate = (id: string) => {
    if (!editPrice) return;
    const affectedIds = findAffectedNodes(id, nodes);
    setAffectedNodes(affectedIds);
    updateMaterial(id, { unitPrice: parseFloat(editPrice) });
    setEditingId(null);
    setEditPrice("");
    setTimeout(() => {
      useStore.getState().clearAffected();
    }, 3000);
  };

  const recentLogs = priceLogs.slice(0, 20);

  return (
    <div className="min-h-screen bg-charcoal-800 bg-grain">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-gold-500 text-shadow-gold">
              原料库
            </h1>
            <p className="text-sm text-charcoal-300 mt-1">
              管理底层原料价格，修改后自动传导至所有关联产品
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-charcoal-900 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增原料
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 p-4 bg-charcoal-900 border border-gold-900/30 rounded-xl animate-fade-in">
            <h3 className="text-sm font-semibold text-gold-400 mb-3">
              新增原料
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="原料名称"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 bg-charcoal-700 border border-charcoal-600 rounded-lg text-sm text-charcoal-50 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500"
              />
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="px-3 py-2 bg-charcoal-700 border border-charcoal-600 rounded-lg text-sm text-charcoal-50 focus:outline-none focus:border-gold-500"
              >
                {["kg", "g", "L", "mL", "个", "只", "条", "斤"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                placeholder="单价(元)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="px-3 py-2 bg-charcoal-700 border border-charcoal-600 rounded-lg text-sm text-charcoal-50 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 bg-charcoal-700 border border-charcoal-600 rounded-lg text-sm text-charcoal-50 focus:outline-none focus:border-gold-500"
              >
                {["肉类", "蔬菜", "调味料", "粉类", "液体", "油脂", "香料", "蛋类", "其他"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 bg-gold-600 hover:bg-gold-500 text-charcoal-900 rounded text-sm font-semibold transition-colors"
              >
                确定
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 bg-charcoal-700 hover:bg-charcoal-600 text-charcoal-200 rounded text-sm transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              type="text"
              placeholder="搜索原料..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-charcoal-900 border border-charcoal-600 rounded-lg text-sm text-charcoal-50 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        <div className="bg-charcoal-900 border border-gold-900/20 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold-900/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-300">
                  原料名称
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-300">
                  分类
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-300">
                  默认单位
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-charcoal-300">
                  单价(元)
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-300">
                  关联产品数
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-charcoal-300">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((material) => {
                const affectedProducts = findAffectedProducts(
                  material.id,
                  nodes
                );
                const isEditing = editingId === material.id;

                return (
                  <tr
                    key={material.id}
                    className="border-b border-charcoal-700/50 hover:bg-charcoal-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold-600" />
                        <span className="text-sm text-charcoal-100 font-medium">
                          {material.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-gold-500/10 text-gold-400 rounded text-xs">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-charcoal-200">
                      {material.defaultUnit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="any"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handlePriceUpdate(material.id)
                            }
                            autoFocus
                            className="w-20 px-2 py-1 bg-charcoal-700 border border-gold-500/50 rounded text-sm text-charcoal-50 text-right focus:outline-none"
                          />
                          <button
                            onClick={() => handlePriceUpdate(material.id)}
                            className="p-1 text-gold-500 hover:text-gold-400"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditPrice("");
                            }}
                            className="p-1 text-charcoal-400 hover:text-charcoal-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(material.id);
                            setEditPrice(material.unitPrice.toString());
                          }}
                          className="group inline-flex items-center gap-1 text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors"
                        >
                          ¥{material.unitPrice.toFixed(2)}
                          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-charcoal-300">
                      {affectedProducts.length}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteMaterial(material.id)}
                        className="p-1.5 text-charcoal-400 hover:text-danger rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recentLogs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-serif text-lg font-bold text-gold-500 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              价格变更日志
            </h2>
            <div className="space-y-2">
              {recentLogs.map((log) => {
                const material = materials.find(
                  (m) => m.id === log.materialId
                );
                const isUp = log.newPrice > log.oldPrice;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 bg-charcoal-900 border border-charcoal-700/50 rounded-lg"
                  >
                    {isUp ? (
                      <TrendingUp className="w-4 h-4 text-danger-light shrink-0" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-success-light shrink-0" />
                    )}
                    <span className="text-sm text-charcoal-100 font-medium">
                      {material?.name ?? "已删除"}
                    </span>
                    <span className="text-xs text-charcoal-400">
                      ¥{log.oldPrice.toFixed(2)} →{" "}
                      <span
                        className={
                          isUp ? "text-danger-light" : "text-success-light"
                        }
                      >
                        ¥{log.newPrice.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-xs text-charcoal-400 ml-auto">
                      {new Date(log.changedAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
