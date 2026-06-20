import { useStore } from "@/store/useStore";
import { Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

export default function UnitConversionPanel() {
  const conversions = useStore((s) => s.conversions);
  const addConversion = useStore((s) => s.addConversion);
  const updateConversion = useStore((s) => s.updateConversion);
  const deleteConversion = useStore((s) => s.deleteConversion);
  const [showAdd, setShowAdd] = useState(false);
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [factor, setFactor] = useState("");

  const handleAdd = () => {
    if (!fromUnit.trim() || !toUnit.trim() || !factor) return;
    addConversion(fromUnit.trim(), toUnit.trim(), parseFloat(factor));
    setFromUnit("");
    setToUnit("");
    setFactor("");
    setShowAdd(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm font-semibold text-gold-500 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          单位换算规则
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gold-500 hover:text-gold-400 border border-gold-700/50 hover:border-gold-500/50 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          新增
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 p-3 bg-charcoal-800 border border-gold-900/20 rounded-lg">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="源单位"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-xs text-charcoal-50 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500"
            />
            <input
              type="text"
              placeholder="目标单位"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-xs text-charcoal-50 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500"
            />
            <input
              type="number"
              step="any"
              placeholder="换算系数"
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
              className="px-2 py-1.5 bg-charcoal-700 border border-charcoal-600 rounded text-xs text-charcoal-50 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-1.5 bg-gold-600 hover:bg-gold-500 text-charcoal-900 rounded text-xs font-semibold transition-colors"
            >
              确定
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-1.5 bg-charcoal-700 hover:bg-charcoal-600 text-charcoal-200 rounded text-xs transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {conversions.map((conv) => (
          <div
            key={conv.id}
            className="group flex items-center gap-2 p-2 hover:bg-charcoal-800/60 rounded transition-colors"
          >
            <span className="text-xs text-charcoal-100 flex-1">
              1{" "}
              <span className="text-gold-400 font-medium">{conv.fromUnit}</span>
              {" = "}
              <span className="text-gold-300 font-semibold">
                {conv.factor}
              </span>{" "}
              <span className="text-gold-400 font-medium">{conv.toUnit}</span>
            </span>
            <button
              onClick={() => deleteConversion(conv.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-400 hover:text-danger rounded transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
