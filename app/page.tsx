"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Search, Landmark, TrendingUp, ShieldCheck, 
  ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Info, Scale, MessageSquare, AlertTriangle, Calculator, Circle, Map as MapIcon
} from "lucide-react"; 
import { supabase } from "@/lib/supabase/client";

const SMI_2026 = 16500;
const ID_GENE_PARL = "eac38466-0ebb-4653-86d1-0a389cba2b07"; 

export default function Home() {
  const [politics, setPolitics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState("inici");
  const [homeFilter, setHomeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [userSalary, setUserSalary] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("politics").select("*, institucions(nom)");
      if (error) throw error;
      const cleaned = (data || []).map(p => ({
        ...p,
        institucio: String(p.institucio_id || p.institucio || "").toLowerCase().trim(),
        institucio_nom: p.categoria || p.institucions?.nom || "Altres",
        sou_brut_anual: Number(p.sou_brut_anual) || 0,
        nom_complet: `${p.nom || ""} ${p.cognoms || ""}`.toLowerCase()
      }));
      setPolitics(cleaned);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredInici = useMemo(() => {
    if (homeFilter === "all") return politics;
    return politics.filter(p => p.institucio === homeFilter.toLowerCase());
  }, [politics, homeFilter]);

  const stats = useMemo(() => {
    const total = filteredInici.reduce((acc, p) => acc + p.sou_brut_anual, 0);
    return { total, count: filteredInici.length };
  }, [filteredInici]);

  if (loading) return <div className="p-10 text-center font-black text-indigo-600">CARREGANT...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col w-full max-w-[100vw] overflow-x-hidden box-border">
      
      {/* HEADER ADAPTATIU */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2" onClick={() => setViewTab("inici")}>
            <TrendingUp className="size-5 text-indigo-600" />
            <h1 className="text-lg font-black uppercase tracking-tighter">QuantCobren.cat</h1>
          </div>
          <nav className="flex bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {["inici", "explora", "rankings"].map((id) => (
              <button key={id} onClick={() => setViewTab(id)} className={`flex-1 px-4 py-2 text-[10px] font-black rounded-lg transition uppercase ${viewTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400'}`}>
                {id}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-8 flex-grow w-full box-border overflow-x-hidden">
        
        {viewTab === "inici" && (
          <div className="space-y-8 w-full overflow-hidden">
            
            {/* FILTRE TERRITORIAL - FLEX WRAP PER EVITAR TALLS */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">Filtre territorial</p>
                <div className="flex flex-wrap gap-2">
                   {["all", "govern", "parlament"].map(f => (
                     <button key={f} onClick={() => setHomeFilter(f)} className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase ${homeFilter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-50'}`}>{f}</button>
                   ))}
                </div>
            </div>

            {/* CARD DINERS - TEXT RESPONSIVE */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                   <p className="text-indigo-200 text-[10px] font-black uppercase mb-1">Total Brut Anual</p>
                   <p className="text-3xl sm:text-6xl font-black tabular-nums break-words leading-none">
                     {new Intl.NumberFormat("ca-ES").format(stats.total)} €
                   </p>
                </div>
                <Landmark className="absolute -right-6 -bottom-6 size-32 opacity-10 rotate-12" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredInici.slice(0, 12).map(p => <PoliticCard key={p.id} p={p} userSalary={userSalary} />)}
            </div>
          </div>
        )}

        {viewTab === "explora" && (
          <div className="space-y-6 w-full overflow-hidden">
            {/* CALCULADORA - FORCEM FLEX-COL SEMPRE AL MÒBIL */}
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 w-full box-border">
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <Calculator className="size-5 text-indigo-600 shrink-0" />
                   <p className="text-[10px] font-black uppercase text-indigo-900">Compara el teu sou:</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <input 
                     type="number" 
                     className="flex-1 md:w-32 bg-white border border-indigo-200 p-3 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-600"
                     placeholder="Ex: 25000"
                     onChange={(e) => setUserSalary(Number(e.target.value))}
                   />
                   <span className="font-black text-indigo-900">€</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {politics.slice(0, 20).map(p => <PoliticCard key={p.id} p={p} userSalary={userSalary} />)}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function PoliticCard({ p, userSalary }) {
  const yearsToMatch = userSalary > 0 ? (p.sou_brut_anual / userSalary).toFixed(1) : null;
  return (
    <div className="bg-white border border-zinc-200 p-5 rounded-3xl flex flex-col h-full shadow-sm">
      <div className="flex-grow min-w-0">
        <h3 className="font-black text-zinc-900 leading-tight truncate">{p.nom} {p.cognoms}</h3>
        <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1 truncate">{p.carrec}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-50 flex items-end justify-between">
        <div className="min-w-0">
          <p className="text-[8px] font-black text-zinc-300 uppercase">Brut Anual</p>
          <p className="text-lg font-black text-indigo-600 truncate">
            {new Intl.NumberFormat("ca-ES").format(p.sou_brut_anual)} €
          </p>
        </div>
        {yearsToMatch && (
          <div className="bg-indigo-50 px-2 py-1 rounded text-[8px] font-black text-indigo-600 uppercase shrink-0">
            {yearsToMatch}y
          </div>
        )}
      </div>
    </div>
  );
}