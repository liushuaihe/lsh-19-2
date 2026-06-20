import ProductList from "@/components/ProductList";
import IngredientTree from "@/components/IngredientTree";
import CostPanel from "@/components/CostPanel";
import UnitConversionPanel from "@/components/UnitConversionPanel";
import { Calculator, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [rightTab, setRightTab] = useState<"cost" | "conversion">("cost");

  return (
    <div className="h-screen flex overflow-hidden bg-charcoal-800 bg-grain">
      <ProductList />

      <IngredientTree />

      <div className="w-80 h-full flex flex-col bg-charcoal-900 border-l border-gold-900/20">
        <div className="flex border-b border-gold-900/20">
          <button
            onClick={() => setRightTab("cost")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              rightTab === "cost"
                ? "text-gold-400 border-b-2 border-gold-500"
                : "text-charcoal-400 hover:text-charcoal-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            成本面板
          </button>
          <button
            onClick={() => setRightTab("conversion")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              rightTab === "conversion"
                ? "text-gold-400 border-b-2 border-gold-500"
                : "text-charcoal-400 hover:text-charcoal-200"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            单位换算
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rightTab === "cost" ? <CostPanel /> : <UnitConversionPanel />}
        </div>
      </div>
    </div>
  );
}
