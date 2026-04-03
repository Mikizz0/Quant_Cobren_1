"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Search, Landmark, TrendingUp, ShieldCheck, 
  ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Info, Scale, MessageSquare, AlertTriangle, Calculator, Circle, Map as MapIcon
} from "lucide-react"; 
import { supabase } from "@/lib/supabase/client";

// --- CONSTANTS GLOBALS ---
const SMI_2026 = 16500;
const ID_GENE_PARL = "eac38466-0ebb-4653-86d1-0a389cba2b07"; 
const ID_DIBA = "697f5db1-b6ca-4c15-94c4-a300618020a3";
const ID_DDGI = "801a2904-e0be-4072-859d-68a3a2fb3ad7";
const ID_DDLLE = "fd6f16d1-54a4-4545-ace1-79e9e5f6c644";
const ID_DDTAR = "bc4e6420-b0f0-4270-bb01-e6486f2f5dd8";

export default function Home() {
  const [politics, setPolitics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState("inici");
  const [homeFilter, setHomeFilter] = useState("all");
  const [exploraFilter, setExploraFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportText, setReportText] = useState("");
  const [userSalary, setUserSalary] = useState(0);

  const ITEMS_PER_PAGE = 12;

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
    } catch (err) { 
      console.error("Error Supabase:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredInici = useMemo(() => {
    if (homeFilter === "all") return politics;
    if (homeFilter === "parlament") return politics.filter(p => p.institucio_nom.toLowerCase().includes("parlament"));
    if (homeFilter === "govern") return politics.filter(p => p.institucio === ID_GENE_PARL && !p.institucio_nom.toLowerCase().includes("parlament"));
    return politics.filter(p => p.institucio === homeFilter.toLowerCase());
  }, [politics, homeFilter]);

  const stats = useMemo(() => {
    const total = filteredInici.reduce((acc, p) => acc + p.sou_brut_anual, 0);
    return { total, count: filteredInici.length };
  }, [filteredInici]);

  const filteredExplora = useMemo(() => {
    return politics.filter(p => {
      const matchesSearch = p.nom_complet.includes(query.toLowerCase()) || (p.carrec || "").toLowerCase().includes(query.toLowerCase());
      const matchesInsti = exploraFilter === "all" || p.institucio === exploraFilter.toLowerCase();
      return matchesSearch && matchesInsti;
    });
  }, [politics, query, exploraFilter]);

  const paginatedExplora = filteredExplora.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredExplora.length / ITEMS_PER_PAGE);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Carregant transparència...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col w-full overflow-x-hidden">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewTab("inici")}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><TrendingUp className="size-5" /></div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Quant<span className="text-indigo-600">Cobren</span>.cat</h1>
          </div>
          <nav className="flex bg-zinc-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {["inici", "explora", "rankings", "sobre"].map((id) => (
              <button key={id} onClick={() => setViewTab(id)} className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black rounded-lg transition uppercase whitespace-nowrap ${viewTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
                {id}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-10 flex-grow w-full box-border overflow-x-hidden">
        {viewTab === "inici" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="font-black uppercase text-xs mb-6 tracking-widest flex items-center gap-2 text-zinc-400"><MapIcon className="size-4" /> Filtre territorial</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                   {[
                     {id:"all", l:"Tota Catalunya"}, {id:"govern", l:"Generalitat"}, {id:"parlament", l:"Parlament"},
                     {id:ID_DIBA, l:"Barcelona"}, {id:ID_DDGI, l:"Girona"}, {id:ID_DDLLE, l:"Lleida"}, {id:ID_DDTAR, l:"Tarragona"}
                   ].map(f => (
                     <button key={f.id} onClick={() => setHomeFilter(f.id)} className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${homeFilter === f.id ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border-transparent'}`}>{f.l}</button>
                   ))}
                </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-2">
                   <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Total Pressupost en Sous</p>
                   <p className="text-4xl sm:text-7xl font-black tabular-nums break-words leading-none tracking-tighter">
                     {new Intl.NumberFormat("ca-ES").format(stats.total)} €
                   </p>
                   <p className="text-indigo-100/60 text-[10px] font-bold uppercase tracking-widest">Dades de {stats.count} càrrecs públics</p>
                </div>
                <Landmark className="absolute -right-10 -bottom-10 size-48 opacity-10 rotate-12" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredInici.slice(0, 8).map(p => <PoliticCard key={p.id} p={p} userSalary={userSalary} />)}
            </div>
          </div>
        )}

        {viewTab === "explora" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-indigo-50 border border-indigo-100 p-5 sm:p-6 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-4 w-full max-w-full box-border overflow-hidden">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                   <div className="bg-indigo-600 p-2.5 rounded-xl text-white shrink-0 shadow-lg shadow-indigo-200"><Calculator className="size-5" /></div>
                   <p className="text-[10px] font-black uppercase text-indigo-900 leading-tight">Calculadora de comparativa salarial:</p>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto bg-white/50 p-1 rounded-xl lg:bg-transparent">
                   <input 
                     type="number" 
                     className="flex-1 lg:w-40 bg-white border border-indigo-200 p-3 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-600"
                     placeholder="El teu sou (Ex: 25000)"
                     onChange={(e) => setUserSalary(Number(e.target.value))}
                   />
                   <span className="font-black text-indigo-900 pr-3">€</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
                <input type="text" placeholder="Cerca per nom o càrrec..." className="w-full pl-11 p-4 rounded-xl border border-zinc-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedExplora.length > 0 ? paginatedExplora.map(p => <PoliticCard key={p.id} p={p} userSalary={userSalary} />) : <div className="col-span-full py-20 text-center text-zinc-400 font-black uppercase text-xs">Cap representant trobat</div>}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-20"><ChevronLeft /></button>
                <span className="text-[10px] font-black uppercase text-zinc-400">Pàgina {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-20"><ChevronRight /></button>
              </div>
            )}
          </div>
        )}

        {viewTab === "rankings" && (
          <div className="w-full animate-in slide-in-from-bottom-4">
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <tr><th className="px-8 py-5"># Posició</th><th className="py-5">Representant Públic</th><th className="px-8 py-5 text-right">Sou Brut Anual</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[...politics].sort((a,b) => b.sou_brut_anual - a.sou_brut_anual).slice(0, 20).map((p, i) => (
                      <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-8 py-5 text-zinc-300 font-black text-xl">#{i+1}</td>
                        <td className="py-5">
                          <p className="font-black text-zinc-900">{p.nom} {p.cognoms}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">{p.carrec}</p>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-indigo-600 text-lg tabular-nums">
                          {new Intl.NumberFormat("ca-ES").format(p.sou_brut_anual)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-10 text-center">
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">QuantCobren.cat • 2026</p>
      </footer>
    </div>
  );
}

function PoliticCard({ p, userSalary }) {
  const yearsToMatch = userSalary > 0 ? (p.sou_brut_anual / userSalary).toFixed(1) : null;
  const smiRatio = (p.sou_brut_anual / SMI_2026).toFixed(1);

  return (
    <div className="bg-white border border-zinc-200 p-5 rounded-[2rem] flex flex-col h-full shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <div className="flex-grow space-y-2">
        <div className="flex justify-between items-start">
           <Circle className={`size-2.5 fill-current ${p.sou_brut_anual > 100000 ? 'text-red-500' : 'text-green-500'}`} />
           <span className="text-[8px] font-black text-zinc-300 uppercase tracking-tighter">{p.institucio_nom}</span>
        </div>
        <h3 className="font-black text-zinc-900 leading-tight group-hover:text-indigo-600 transition-colors">{p.nom} {p.cognoms}</h3>
        <p className="text-[9px] font-bold text-zinc-400 uppercase leading-snug line-clamp-2">{p.carrec}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-50 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] font-black text-zinc-300 uppercase">Brut Anual</p>
            <p className="text-xl font-black text-zinc-900 tracking-tighter">
              {new Intl.NumberFormat("ca-ES").format(p.sou_brut_anual)} €
            </p>
          </div>
          <p className="text-[9px] font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">{smiRatio}x SMI</p>
        </div>

        {yearsToMatch && (
          <div className="bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/30">
            <p className="text-[8px] font-black text-indigo-600 uppercase leading-tight">
              Necessitaries <span className="text-indigo-900">{yearsToMatch} anys</span> de la teva feina per igualar-lo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}