"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Search, Landmark, TrendingUp, ShieldCheck, 
  ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Info, Scale, MessageSquare, AlertTriangle, Calculator, Circle, Map as MapIcon
} from "lucide-react"; // He tret 'Download' i 'Send' que no es feien servir
import { supabase } from "@/lib/supabase/client";

// --- CONFIGURACIÓ DE CONSTANTS 2026 ---
const SMI_2026 = 16500;
const ID_GENE_PARL = "eac38466-0ebb-4653-86d1-0a389cba2b07"; 
const ID_DIBA = "697f5db1-b6ca-4c15-94c4-a300618020a3";
const ID_DDGI = "801a2904-e0be-4072-859d-68a3a2fb3ad7";
const ID_DDLLE = "fd6f16d1-54a4-4545-ace1-79e9e5f6c644";
const ID_DDTAR = "bc4e6420-b0f0-4270-bb01-e6486f2f5dd8";

export default function Home() {
  const [politics, setPolitics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<"inici" | "explora" | "rankings" | "sobre">("inici");
  
  const [homeFilter, setHomeFilter] = useState("all");
  const [exploraFilter, setExploraFilter] = useState("all");
  const [query, setQuery] = useState("");
  
  const [rankingTab, setRankingTab] = useState("global"); 
  const [rankingSubTab, setRankingSubTab] = useState("totes");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const [reportText, setReportText] = useState("");
  const [userSalary, setUserSalary] = useState<number | "">(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("politics").select("*, institucions(nom)");
      if (error) throw error;

      const cleaned = (data || []).map(p => {
        let instId = p.institucio_id || p.institucio || "";
        if (typeof instId === 'object') instId = (instId as any).id || "";

        return {
          ...p,
          institucio: String(instId).toLowerCase().trim(),
          institucio_nom: p.categoria || p.institucions?.nom || "Altres",
          sou_brut_anual: Number(p.sou_brut_anual) || 0,
          nom_complet: `${p.nom || ""} ${p.cognoms || ""}`.toLowerCase()
        };
      });

      setPolitics(cleaned);
    } catch (err) {
      console.error("Error carregant dades:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setCurrentPage(1); }, [query, exploraFilter]);

  // FILTRES I LÒGICA DE VISTA (INICI)
  const filteredInici = useMemo(() => {
    if (homeFilter === "all") return politics;
    if (homeFilter === "parlament") return politics.filter(p => p.institucio_nom.toLowerCase().includes("parlament"));
    if (homeFilter === "govern") return politics.filter(p => p.institucio === ID_GENE_PARL && !p.institucio_nom.toLowerCase().includes("parlament"));
    return politics.filter(p => p.institucio === homeFilter.toLowerCase());
  }, [politics, homeFilter]);

  const stats = useMemo(() => {
    const total = filteredInici.reduce((acc, p) => acc + p.sou_brut_anual, 0);
    const noms: Record<string, string> = {
      all: "Total Catalunya", govern: "Govern de la Generalitat", parlament: "Parlament de Catalunya",
      [ID_DIBA]: "Diputació de Barcelona", [ID_DDGI]: "Diputació de Girona",
      [ID_DDLLE]: "Diputació de Lleida", [ID_DDTAR]: "Diputació de Tarragona"
    };
    return { total, count: filteredInici.length, titol: noms[homeFilter] || "Institució" };
  }, [filteredInici, homeFilter]);

  // FILTRES I LÒGICA DE VISTA (EXPLORA)
  const filteredExplora = useMemo(() => {
    return politics.filter(p => {
      const matchesSearch = p.nom_complet.includes(query.toLowerCase()) || (p.carrec || "").toLowerCase().includes(query.toLowerCase()) || (p.partit || "").toLowerCase().includes(query.toLowerCase());
      let matchesInsti = exploraFilter === "all";
      if (exploraFilter === "parlament") matchesInsti = p.institucio_nom.toLowerCase().includes("parlament");
      else if (exploraFilter === "govern") matchesInsti = p.institucio === ID_GENE_PARL && !p.institucio_nom.toLowerCase().includes("parlament");
      else if (exploraFilter !== "all") matchesInsti = p.institucio === exploraFilter.toLowerCase();
      return matchesSearch && matchesInsti;
    });
  }, [politics, query, exploraFilter]);

  const paginatedExplora = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExplora.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExplora, currentPage]);

  const totalPages = Math.ceil(filteredExplora.length / ITEMS_PER_PAGE);

  // LÒGICA DE RÀNKINGS
  const rankingData = useMemo(() => {
    let subset = politics;
    if (rankingTab === "parlament") subset = politics.filter(p => p.institucio_nom.toLowerCase().includes("parlament"));
    else if (rankingTab === "govern") subset = politics.filter(p => p.institucio === ID_GENE_PARL && !p.institucio_nom.toLowerCase().includes("parlament"));
    else if (rankingTab === "diputacions") {
      const dipus = [ID_DIBA, ID_DDGI, ID_DDLLE, ID_DDTAR].map(id => id.toLowerCase());
      subset = politics.filter(p => dipus.includes(p.institucio));
      if (rankingSubTab !== "totes") subset = subset.filter(p => p.institucio === rankingSubTab.toLowerCase());
    }
    return [...subset].sort((a, b) => b.sou_brut_anual - a.sou_brut_anual).slice(0, 10);
  }, [politics, rankingTab, rankingSubTab]);

  const formatEuro = (n: number) => new Intl.NumberFormat("ca-ES").format(n) + " €";

  const handleReport = () => {
    if(!reportText) return;
    alert("Gràcies! Hem rebut el teu comentari.");
    setReportText("");
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Carregant transparència 2026...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewTab("inici")}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><TrendingUp className="size-5" /></div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Quant<span className="text-indigo-600">Cobren</span>.cat</h1>
          </div>
          <nav className="flex bg-zinc-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {["inici", "explora", "rankings", "sobre"].map((id) => (
              <button key={id} onClick={() => setViewTab(id as any)} className={`px-4 py-2 text-[10px] font-black rounded-lg transition uppercase whitespace-nowrap ${viewTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
                {id === "rankings" ? "RÀNKINGS" : id === "sobre" ? "SOBRE NOSALTRES" : id}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-10 flex-grow w-full">
        {viewTab === "inici" && (
          <div className="animate-in fade-in duration-500 space-y-10">
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                   <div className="bg-zinc-100 p-2 rounded-xl text-zinc-900"><MapIcon className="size-5" /></div>
                   <div>
                     <h4 className="font-black uppercase text-xs tracking-widest">Filtre territorial</h4>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase">Selecciona una província o institució central</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                   {[
                     {id:"all", l:"Tota Catalunya", c:"bg-zinc-900 text-white"},
                     {id:"govern", l:"Generalitat", c:"border-zinc-200 text-zinc-600"},
                     {id:"parlament", l:"Parlament", c:"border-zinc-200 text-zinc-600"},
                     {id:ID_DIBA, l:"Barcelona", c:"border-indigo-100 bg-indigo-50/50 text-indigo-700"},
                     {id:ID_DDGI, l:"Girona", c:"border-indigo-100 bg-indigo-50/50 text-indigo-700"},
                     {id:ID_DDLLE, l:"Lleida", c:"border-indigo-100 bg-indigo-50/50 text-indigo-700"},
                     {id:ID_DDTAR, l:"Tarragona", c:"border-indigo-100 bg-indigo-50/50 text-indigo-700"}
                   ].map(f => (
                     <button 
                       key={f.id} 
                       onClick={() => setHomeFilter(f.id)} 
                       className={`p-4 rounded-2xl border text-[9px] font-black uppercase transition-all hover:scale-105 active:scale-95 ${homeFilter === f.id ? 'ring-2 ring-indigo-600 ring-offset-2' : ''} ${f.c}`}
                     >
                       {f.l}
                     </button>
                   ))}
                </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden transition-all hover:scale-[1.005]">
                <div className="relative z-10 space-y-2">
                   <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">{stats.titol}</p>
                   <p className="text-5xl sm:text-7xl font-black tabular-nums tracking-tighter">{formatEuro(stats.total)}</p>
                   <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest">Dades oficials de {stats.count} càrrecs públics</p>
                </div>
                <Landmark className="absolute -right-12 -bottom-12 size-64 opacity-10 rotate-12 text-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredInici.slice(0, 8).map(p => <PoliticCard key={p.id} p={p} userSalary={userSalary} />)}
            </div>
          </div>
        )}

        {viewTab === "explora" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200"><Calculator className="size-6" /></div>
                   <div>
                      <h4 className="font-black uppercase text-xs tracking-widest text-indigo-900">Calculadora comparativa</h4>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">Compara el teu sou amb el dels polítics</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <span className="text-[10px] font-black uppercase text-indigo-400 whitespace-nowrap">El meu sou anual:</span>
                   <input 
                     type="number" 
                     placeholder="Ex: 25000" 
                     className="bg-white border border-indigo-200 p-3 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-600 w-full md:w-32"
                     onChange={(e) => setUserSalary(Number(e.target.value))}
                   />
                   <span className="text-lg font-black text-indigo-900">€</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" placeholder="Cerca per nom, càrrec o partit..." className="w-full pl-12 p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <div className="relative sm:w-80">
                <select className="w-full h-full p-5 pr-10 rounded-2xl border border-zinc-200 bg-white shadow-sm font-black text-[10px] uppercase outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-600" value={exploraFilter} onChange={e => setExploraFilter(e.target.value)}>
                  <option value="all">Totes les institucions</option>
                  <option value="govern">Govern Generalitat</option>
                  <option value="parlament">Parlament</option>
                  <option value={ID_DIBA}>Diputació Barcelona</option>
                  <option value={ID_DDGI}>Diputació Girona</option>
                  <option value={ID_DDLLE}>Diputació Lleida</option>
                  <option value={ID_DDTAR}>Diputació Tarragona</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedExplora.length > 0 ? paginatedExplora.map(p => <PoliticCard key={p.id} p={p} userSalary={userSalary} />) : <div className="col-span-full text-center py-20 text-zinc-400 font-bold uppercase tracking-widest">Cap representant trobat</div>}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm mt-8">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 disabled:opacity-20 transition-colors"><ChevronLeft className="size-5" /></button>
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Pàgina {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 disabled:opacity-20 transition-colors"><ChevronRight className="size-5" /></button>
              </div>
            )}
          </div>
        )}

        {viewTab === "rankings" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex flex-wrap justify-center gap-2 bg-zinc-200/50 p-1.5 rounded-2xl">
                {["global", "govern", "parlament", "diputacions"].map(t => (
                  <button key={t} onClick={() => { setRankingTab(t); setRankingSubTab("totes"); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition ${rankingTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {rankingTab === "diputacions" && (
                <div className="flex justify-center gap-2 overflow-x-auto pb-2 w-full max-w-lg no-scrollbar">
                  {[{id:"totes", l:"Totes"}, {id:ID_DIBA, l:"BCN"}, {id:ID_DDGI, l:"GI"}, {id:ID_DDLLE, l:"LLE"}, {id:ID_DDTAR, l:"TAR"}].map(t => (
                    <button key={t.id} onClick={() => setRankingSubTab(t.id)} className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase transition shrink-0 ${rankingSubTab === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-zinc-200 text-zinc-400 bg-white hover:bg-zinc-50'}`}>{t.l}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]"><tr className="px-8"><th className="px-8 py-5">#</th><th className="py-5">Representant</th><th className="px-8 py-5 text-right">Sou Anual</th></tr></thead>
                <tbody className="divide-y divide-zinc-100">
                  {rankingData.map((p, i) => (
                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-8 py-6 text-zinc-300 font-black text-xl">#{i + 1}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-2"><p className="font-black text-zinc-900">{p.nom} {p.cognoms}</p>{p.partit && <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{p.partit}</span>}</div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5 line-clamp-1">{p.carrec}</p>
                        <p className="text-[9px] text-zinc-300 font-black uppercase tracking-tighter mt-1">{p.institucio_nom}</p>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg tabular-nums">{formatEuro(p.sou_brut_anual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewTab === "sobre" && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 py-10">
             <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Sobre el projecte</h2>
                <p className="text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto">QuantCobren.cat és una eina independent de dades obertes i una iniciativa unipersonal. Facilitant la transparència per una ciutadania més informada.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col items-center text-center transition-transform hover:scale-105">
                   <ShieldCheck className="size-10 text-indigo-600 mb-4" />
                   <h4 className="font-black uppercase text-[10px] mb-2 tracking-widest">Dades Reals i Base</h4>
                   <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">Informació extreta dels portals oficials. Les xifres mostrades corresponen al **sou brut anual base** i no inclouen dietes, indemnitzacions per desplaçament ni altres despeses de representació.</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col items-center text-center transition-transform hover:scale-105">
                   <Scale className="size-10 text-indigo-600 mb-4" />
                   <h4 className="font-black uppercase text-[10px] mb-2 tracking-widest">Comparativa Social</h4>
                   <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">Fem servir l'SMI 2026 i calculadores personalitzades per donar context al valor dels diners públics.</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col items-center text-center transition-transform hover:scale-105">
                   <Info className="size-10 text-indigo-600 mb-4" />
                   <h4 className="font-black uppercase text-[10px] mb-2 tracking-widest">Independència</h4>
                   <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">No tenim vinculació partidista. Som una iniciativa ciutadana que creu en el dret de l'accés a la informació.</p>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><MessageSquare className="size-5" /></div>
                   <h4 className="font-black uppercase text-xs tracking-widest">Reportar errors o suggeriments</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                   <input type="text" placeholder="Has vist alguna dada incorrecta?" className="flex-1 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-600" value={reportText} onChange={(e) => setReportText(e.target.value)} />
                   <button onClick={handleReport} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">Enviar</button>
                </div>
             </div>

             <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-zinc-400 space-y-8">
                <div className="flex items-center gap-2 text-white">
                  <AlertTriangle className="size-5 text-amber-500" />
                  <h4 className="font-black uppercase text-xs tracking-widest text-white">Termes, Condicions i Disclaimer</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <p className="text-[11px] font-black text-zinc-200 uppercase tracking-widest">1. Caràcter Informatiu</p>
                      <p className="text-[10px] leading-relaxed">L'ús d'aquesta web és purament informatiu. Les dades mostrades provenen de portals de transparència però no tenen validesa jurídica. L'usuari accepta que QuantCobren.cat no és responsable de decisions preses basant-se en aquesta informació.</p>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[11px] font-black text-zinc-200 uppercase tracking-widest">2. Dades i Privacitat</p>
                      <p className="text-[10px] leading-relaxed">No recollim dades personals. Els sous publicats corresponen a càrrecs electes o personal de lliure designació, dades que són de caràcter públic segons la Llei 19/2014 de transparència.</p>
                   </div>
                </div>
                <p className="text-[9px] border-t border-zinc-800 pt-6 opacity-50">Darrera actualització: Març 2026. L'accés implica l'acceptació d'aquests termes.</p>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-16">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h4 className="font-black uppercase text-xs tracking-widest text-zinc-900">QuantCobren.cat</h4>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-tighter">Exercici 2026 • Dades Obertes</p>
          </div>
          
          <div className="space-y-4">
            <h5 className="font-black uppercase text-[9px] text-zinc-300 tracking-[0.2em]">Fonts oficials (I)</h5>
            <ul className="space-y-3">
              <li>
                <a href="https://www.parlament.cat/pcat/parlament/transparencia/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-indigo-600 flex items-center justify-center md:justify-start gap-2 uppercase transition-colors">
                  <ExternalLink className="size-3" /> Parlament
                </a>
              </li>
              <li>
                <a href="https://governobert.gencat.cat/ca/transparencia/dades-obertes/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-indigo-600 flex items-center justify-center md:justify-start gap-2 uppercase transition-colors">
                  <ExternalLink className="size-3" /> Generalitat
                </a>
              </li>
              <li>
                <a href="https://transparencia.diba.cat/carrecs-publics-i-personal-directiu" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-indigo-600 flex items-center justify-center md:justify-start gap-2 uppercase transition-colors">
                  <ExternalLink className="size-3" /> Dipu Barcelona
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4 pt-7 lg:pt-8">
            <ul className="space-y-3">
              <li>
                <a href="https://www.ddgi.cat" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-indigo-600 flex items-center justify-center md:justify-start gap-2 uppercase transition-colors">
                  <ExternalLink className="size-3" /> Dipu Girona
                </a>
              </li>
              <li>
                <a href="https://www.diputaciolleida.cat/la-diputacio/transparencia/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-indigo-600 flex items-center justify-center md:justify-start gap-2 uppercase transition-colors">
                  <ExternalLink className="size-3" /> Dipu Lleida
                </a>
              </li>
              <li>
                <a href="https://www.dipta.cat/transparencia" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-indigo-600 flex items-center justify-center md:justify-start gap-2 uppercase transition-colors">
                  <ExternalLink className="size-3" /> Dipu Tarragona
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-6 rounded-3xl space-y-2">
            <h5 className="font-black uppercase text-[9px] text-indigo-600 tracking-[0.2em]">Referència SMI 2026</h5>
            <p className="text-indigo-900 font-black text-2xl tracking-tighter">16.500 €</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PoliticCard({ p, userSalary }: { p: any, userSalary: number | "" }) {
  const formatEuro = (n: number) => new Intl.NumberFormat("ca-ES").format(n) + " €";
  
  const isHighSalary = p.sou_brut_anual >= 100000;
  
  const getDotColor = () => {
    if (p.sou_brut_anual > 100000) return "text-red-500";
    if (p.sou_brut_anual > 60000) return "text-amber-500";
    return "text-green-500";
  };

  const yearsToMatch = userSalary && userSalary > 0 
    ? (p.sou_brut_anual / userSalary).toFixed(1) 
    : null;

  return (
    <div className="bg-white border border-zinc-200 p-6 rounded-[2.5rem] hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 h-6">
        <Circle className={`size-3 fill-current ${getDotColor()}`} />
        
        {isHighSalary && (
          <div className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-1 rounded-lg uppercase border border-amber-200 flex items-center gap-1 shadow-sm">
            <TrendingUp className="size-2.5" />
            Sou Destacat
          </div>
        )}
      </div>
      
      <div className="flex-grow space-y-3">
        <div>
          <h3 className="text-lg font-black text-zinc-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {p.nom} {p.cognoms}
          </h3>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[7px] font-black text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">
              {p.institucio_nom}
            </span>
            {p.partit && (
              <span className="text-[7px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                {p.partit}
              </span>
            )}
          </div>
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase leading-snug line-clamp-2">
          {p.carrec}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 space-y-3">
        <div className="flex items-end justify-between">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Sou Brut Anual</p>
                <p className="text-2xl font-black text-zinc-900 tracking-tighter">{formatEuro(p.sou_brut_anual)}</p>
            </div>
            <p className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-50 px-2 py-1 rounded-lg">
              {(p.sou_brut_anual / SMI_2026).toFixed(1)}x SMI
            </p>
        </div>

        {yearsToMatch && (
           <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 animate-in zoom-in-95">
              <div className="flex items-start gap-2">
                <Scale className="size-3 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter leading-tight">
                  Necessitaries <span className="text-indigo-900 text-[10px]">{yearsToMatch} anys</span> de la teva feina per cobrar el seu sou d'un any.
                </p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}