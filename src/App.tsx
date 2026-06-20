import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Materials from "@/pages/Materials";
import { Calculator, Package } from "lucide-react";

function Nav() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isMaterials = location.pathname === "/materials";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 bg-charcoal-900/90 backdrop-blur-md border border-gold-900/30 rounded-2xl shadow-2xl shadow-black/30">
      <Link
        to="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          isHome
            ? "bg-gold-500/20 text-gold-400"
            : "text-charcoal-300 hover:text-charcoal-100"
        }`}
      >
        <Calculator className="w-4 h-4" />
        配料表
      </Link>
      <Link
        to="/materials"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          isMaterials
            ? "bg-gold-500/20 text-gold-400"
            : "text-charcoal-300 hover:text-charcoal-100"
        }`}
      >
        <Package className="w-4 h-4" />
        原料库
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/materials" element={<Materials />} />
      </Routes>
      <Nav />
    </Router>
  );
}
