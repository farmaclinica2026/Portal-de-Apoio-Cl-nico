/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Info, 
  Trash2, 
  RotateCcw, 
  ChevronRight, 
  Calculator, 
  Activity, 
  BookOpen, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  CornerDownRight, 
  Eye,
  PlusCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  Volume2,
  ArrowLeft,
  Lock,
  Layers,
  Pill,
  FileText,
  ShieldAlert,
  AlertTriangle,
  XCircle
} from 'lucide-react';

import { AnimatePresence, motion } from 'motion/react';
import { Medicamento, SondaMedicamento, CategoriaFilter, CalculadoraState } from './types';
import { MEDICAMENTOS_SEED, SONDA_MEDICAMENTOS_SEED } from './data';
import AprazamentoModulo from './components/AprazamentoModulo';
import CalculadorasModulo from './components/CalculadorasModulo';

const getViaDescription = (via: string) => {
  switch (via.toUpperCase()) {
    case 'EV': return 'endovenoso';
    case 'IM': return 'intramuscular';
    case 'SC': return 'subcutâneo';
    case 'INAL': return 'inalatório';
    case 'ITC': return 'intratecal';
    case 'VO': return 'via oral';
    case 'VR': return 'via retal';
    case 'IA': return 'intra-arterial';
    case 'LOCAL': return 'infiltração local';
    case 'EPIDURAL': return 'peridural / epidural';
    case 'CAUDAL': return 'caudal';
    default: return '';
  }
};

export default function App() {
  // --- STATE ---
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string>('Todos');
  const [searchQuerySonda, setSearchQuerySonda] = useState('');
  const [selectedSondaFilter, setSelectedSondaFilter] = useState<'Todos' | 'Sim' | 'Não' | 'Restrito'>('Todos');
  const [activeTab, setActiveTab] = useState<'guia' | 'calculadora' | 'cadastro'>('guia');
  const [currentView, setCurrentView] = useState<'home' | 'manual' | 'sonda' | 'aprazamento' | 'calculadoras'>('home');
  const [selectedMed, setSelectedMed] = useState<Medicamento | null>(null);
  const [selectedSondaMed, setSelectedSondaMed] = useState<SondaMedicamento | null>(null);
  const [aplicarCalculadora, setAplicarCalculadora] = useState(false);
  const [selectedUpcomingModule, setSelectedUpcomingModule] = useState<{
    title: string;
    subtitle: string;
    desc: string;
    icon: any;
    tag: string;
  } | null>(null);

  // Custom drug form state
  const [newMed, setNewMed] = useState<Partial<Medicamento>>({
    nome: '',
    forma: '',
    categoria: 'Outros',
    vias: [],
    dose: '',
    reconstituicao: '',
    diluicao: '',
    tempo: '',
    estabilidade: '',
    sonda: 'Sim',
    observacoes: '',
  });

  // Calculator State
  const [calc, setCalc] = useState<CalculadoraState>({
    volume: 100,
    tempoHoras: 1,
    tempoMinutos: 0,
    usarMinutos: false,
  });

  // Dose Calculator State
  const [targetDose, setTargetDose] = useState<number>(300);
  const [ampConcentration, setAmpConcentration] = useState<number>(100); // e.g. 100mg/mL in case of acetilcisteina
  const [calculatedVolumeToDraw, setCalculatedVolumeToDraw] = useState<number | null>(null);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('manual_medicamentos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Medicamento[];
        // Keep only custom medications added by the user in this list
        const customs = parsed.filter(m => m.customizado || m.id.startsWith('custom_'));
        // Combine the official seed database with the user's custom medications
        const combined = [...MEDICAMENTOS_SEED, ...customs];
        setMedicamentos(combined);
        localStorage.setItem('manual_medicamentos', JSON.stringify(combined));
      } catch (e) {
        setMedicamentos(MEDICAMENTOS_SEED);
      }
    } else {
      setMedicamentos(MEDICAMENTOS_SEED);
      localStorage.setItem('manual_medicamentos', JSON.stringify(MEDICAMENTOS_SEED));
    }
  }, []);

  // Save state helper
  const saveMedicamentos = (updatedList: Medicamento[]) => {
    setMedicamentos(updatedList);
    localStorage.setItem('manual_medicamentos', JSON.stringify(updatedList));
  };



  // Clear all registered drugs
  const handleClearAll = () => {
    if (window.confirm('ATENÇÃO: Você deseja apagar TODOS os medicamentos cadastrados do manual? Esta operação é irreversível e removerá também os dados padrões.')) {
      saveMedicamentos([]);
      setSearchQuery('');
      setSelectedRoute('Todos');
      setSelectedMed(null);
    }
  };

  // Add custom drug
  const handleAddMed = (e: FormEvent) => {
    e.preventDefault();
    if (!newMed.nome || !newMed.forma || !newMed.vias || newMed.vias.length === 0) {
      alert('Por favor, preencha o Nome, a Apresentação Física e marque ao menos uma Via de Administração.');
      return;
    }

    const created: Medicamento = {
      id: `custom_${Date.now()}`,
      nome: newMed.nome.toUpperCase().trim(),
      forma: newMed.forma.trim(),
      categoria: newMed.categoria || 'Outros',
      vias: newMed.vias,
      dose: newMed.dose || 'Dose sob diretrizes médicas individuais.',
      reconstituicao: newMed.reconstituicao || 'Não aplicável.',
      diluicao: newMed.diluicao || 'Soro Fisiológico (SF) 0,9% ou Soro Glicosado (SG) 5%.',
      tempo: newMed.tempo || 'Conforme velocidade de tolerância do paciente.',
      estabilidade: newMed.estabilidade || 'Usar logo após a preparação.',
      sonda: (newMed.sonda as 'Sim' | 'Não' | 'Restrito') || 'Sim',
      observacoes: newMed.observacoes?.trim() || '',
      customizado: true,
    };

    const updated = [created, ...medicamentos];
    saveMedicamentos(updated);

    // Reset Form
    setNewMed({
      nome: '',
      forma: '',
      categoria: 'Outros',
      vias: [],
      dose: '',
      reconstituicao: '',
      diluicao: '',
      tempo: '',
      estabilidade: '',
      sonda: 'Sim',
      observacoes: '',
    });

    // Go to list
    setActiveTab('guia');
    alert(`Medicamento "${created.nome}" cadastrado com sucesso no manual!`);
  };

  // Delete drug
  const handleDeleteMed = (id: string, name: string) => {
    if (window.confirm(`Excluir o medicamento "${name}" do manual?`)) {
      const updated = medicamentos.filter((m) => m.id !== id);
      saveMedicamentos(updated);
      if (selectedMed?.id === id) {
        setSelectedMed(null);
      }
    }
  };

  // Toggle route checkbox in form
  const handleRouteToggle = (route: string) => {
    const current = newMed.vias || [];
    if (current.includes(route)) {
      setNewMed({ ...newMed, vias: current.filter((v) => v !== route) });
    } else {
      setNewMed({ ...newMed, vias: [...current, route] });
    }
  };

  // Dose Calculation trigger
  useEffect(() => {
    if (targetDose > 0 && ampConcentration > 0) {
      setCalculatedVolumeToDraw(targetDose / ampConcentration);
    } else {
      setCalculatedVolumeToDraw(null);
    }
  }, [targetDose, ampConcentration]);

  // Helper to normalize strings (remove accents/diacritics and casing)
  const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // --- FILTERS LOGIC ---
  const filteredMedicamentos = medicamentos.filter((m) => {
    // 1. Search Query (Name, form notes or observations) - ignoring accents and casing
    const queryNorm = normalizeText(searchQuery);
    const matchesSearch = 
      normalizeText(m.nome).includes(queryNorm) ||
      normalizeText(m.forma).includes(queryNorm) ||
      (m.observacoes && normalizeText(m.observacoes).includes(queryNorm));

    // 2. Class Route Filter
    const matchesRoute = selectedRoute === 'Todos' || m.vias.includes(selectedRoute);

    return matchesSearch && matchesRoute;
  });

  const filteredMedicamentosSonda = SONDA_MEDICAMENTOS_SEED.filter((m) => {
    // 1. Search Query (Ativo, comercial, preparoComprimido or recomendacoes) - ignoring accents and casing
    const queryNorm = normalizeText(searchQuerySonda);
    const matchesSearch = 
      normalizeText(m.ativo).includes(queryNorm) ||
      normalizeText(m.forma).includes(queryNorm) ||
      normalizeText(m.comercial).includes(queryNorm) ||
      normalizeText(m.preparoComprimido).includes(queryNorm) ||
      normalizeText(m.preparoLiquido).includes(queryNorm) ||
      normalizeText(m.recomendacoes).includes(queryNorm);

    // 2. Sonda Filter
    const matchesSonda = selectedSondaFilter === 'Todos' || m.sonda === selectedSondaFilter;

    return matchesSearch && matchesSonda;
  });

  // Math equations for IV rate calculator
  const calcResults = (() => {
    const vol = Number(calc.volume) || 0;
    const hrs = Number(calc.tempoHoras) || 0;
    const mins = Number(calc.tempoMinutos) || 0;

    let timeInHours = 0;
    let timeInMinutes = 0;

    if (calc.usarMinutos) {
      timeInMinutes = mins;
      timeInHours = mins / 60;
    } else {
      timeInHours = hrs + mins / 60;
      timeInMinutes = hrs * 60 + mins;
    }

    if (timeInHours <= 0 || vol <= 0) {
      return { gotasMin: 0, microgotasMin: 0, mlHora: 0 };
    }

    // Gotas/min = Volume / (Horas * 3)
    const gotasMin = Math.round(vol / (timeInHours * 3));
    // Microgotas/min = Volume / Horas (which is equal to mL/h)
    const microgotasMin = Math.round(vol / timeInHours);
    const mlHora = Number((vol / timeInHours).toFixed(1));

    return { gotasMin, microgotasMin, mlHora };
  })();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans" id="app_root">
      
      {/* HEADER SECTION */}
      <header className="bg-gradient-to-r from-blue-700 via-sky-800 to-indigo-900 text-white shadow-xl pt-7 pb-8 px-4 sm:px-6 relative overflow-hidden" id="main_header">
        {/* Abstract shapes for professional aesthetic */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl inline-flex items-center justify-center text-sky-300 shadow-inner w-12 h-12 shrink-0">
                <FlaskConical className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight" id="app_title">
                  {currentView === 'home' 
                    ? 'Portal de Apoio Clínico' 
                    : currentView === 'sonda' 
                      ? 'Guia de Administração via Sonda' 
                      : currentView === 'calculadoras'
                        ? 'Calculadoras Clínicas'
                        : 'Manual de Injetáveis Adulto'}
                </h1>
                <p className="text-sky-100/90 text-sm font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-4 h-4 text-emerald-400 inline shrink-0" />
                  {currentView === 'home' 
                    ? 'Sistemas integrados de apoio à prática clínica e farmácia — ISCAL' 
                    : currentView === 'sonda' 
                      ? 'Recomendações técnicas para preparo e administração enteral — ISCAL'
                      : currentView === 'calculadoras'
                        ? 'Calculadoras de auxílio à decisão e escores prognósticos de risco — ISCAL'
                        : 'Guia Clínico de Diluição, Estabilidade e Administração Hospitalar'}
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Global Nav Tabs - Removed as per clinical user instructions */}
      </header>

      {/* VIEWPORT CONTROLLER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8" id="main_content">
        
        {/* HOMEPAGE PORTAL */}
        {currentView === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
            id="portal_home"
          >
            {/* SECTIONS GRID */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0c3366] flex items-center gap-1.5 px-0.5" id="modules_heading">
                <Layers className="w-4 h-4 text-[#0c3366] shrink-0" />
                Módulos de Apoio Hospitalar
              </h3>
              
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4.5 max-w-xl sm:max-w-2xl mx-auto w-full" id="portal_modules">
                {[
                  {
                    id: 'manual',
                    title: 'Injetáveis',
                    subtitle: 'Manual de Diluição & Vias',
                    desc: 'Diretrizes de estabilidade, fluidos de diluição compatíveis, tempo ideal de infusão e reconstitution de medicamentos injetáveis adultos.',
                    icon: BookOpen,
                    available: true,
                    tag: 'Disponível',
                    colorClass: 'bg-gradient-to-tr from-blue-600 to-sky-400 border-blue-500/30 text-white shadow-[0_4px_12px_rgba(14,165,233,0.25)] group-hover:shadow-[0_6px_16px_rgba(14,165,233,0.35)]',
                  },
                  {
                    id: 'sonda',
                    title: 'Via Sonda',
                    subtitle: 'Diretrizes de Sonda Enteral',
                    desc: 'Instruções clínicas para preparo, trituração e administração segura de comprimidos e cápsulas por Sonda Nasogástrica ou Enteral.',
                    icon: Pill,
                    available: true,
                    tag: 'Disponível',
                    colorClass: 'bg-gradient-to-tr from-teal-600 to-emerald-400 border-teal-500/30 text-white shadow-[0_4px_12px_rgba(20,184,166,0.25)] group-hover:shadow-[0_6px_16px_rgba(20,184,166,0.35)]',
                  },
                  {
                    id: 'calculadoras',
                    title: 'Calculadoras',
                    subtitle: 'Escores & Aprazamento',
                    desc: 'Calculadoras clínicas de suporte à tomada de decisões, escores de risco (Pádua) e aprazamento técnico antimicrobiano.',
                    icon: Calculator,
                    available: true,
                    tag: 'Disponível',
                    colorClass: 'bg-gradient-to-tr from-rose-500 to-orange-400 border-rose-500/30 text-white shadow-[0_4px_12px_rgba(244,63,94,0.25)] group-hover:shadow-[0_6px_16px_rgba(244,63,94,0.35)]',
                  }
                ].map((mod) => {
                  const IconComponent = mod.icon;
                  return (
                    <motion.div
                      key={mod.id}
                      whileHover={{ y: -4, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (mod.available) {
                          setCurrentView(mod.id as 'home' | 'manual' | 'sonda' | 'calculadoras');
                        } else {
                          setSelectedUpcomingModule({
                            title: mod.title,
                            subtitle: mod.subtitle,
                            desc: mod.desc,
                            icon: mod.icon,
                            tag: mod.tag,
                          });
                        }
                      }}
                      className="bg-white rounded-[12px] border border-slate-100 hover:border-blue-500 hover:shadow-[0_8px_16px_rgba(12,51,102,0.04)] transition-all p-2 sm:p-3.5 cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden aspect-square shadow-[0_2px_8px_rgba(12,51,102,0.01)] w-full max-w-[105px] sm:max-w-[115px] mx-auto"
                      id={`module_${mod.id}`}
                    >
                      {/* Icon Centered */}
                      <div className={`w-[32px] h-[32px] rounded-[10px] border flex items-center justify-center mb-1.5 transition-all duration-300 ${mod.colorClass}`} id={`icon_container_${mod.id}`}>
                        <IconComponent className="w-4 h-4 stroke-[2]" />
                      </div>

                      {/* Title Centered */}
                      <h4 className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-800 uppercase tracking-tight leading-tight mb-0.5 group-hover:text-[#0c3366] transition-colors">
                        {mod.title}
                      </h4>

                      {/* Subtitle/Caption Centered */}
                      <p className="text-[7.5px] sm:text-[8px] text-slate-400 leading-tight line-clamp-2 max-w-[85px] mx-auto font-medium">
                        {mod.subtitle}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            

          </motion.div>
        )}

        {/* TAB 1: GUIA DE FÁRMACOS */}
        {currentView === 'manual' && activeTab === 'guia' && (
          <div className="space-y-6" id="view_guia">
            
            {/* BACK BAR TO PORTAL */}
            <div className="flex items-center justify-between pb-1" id="back_navigation_bar">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Voltar ao Portal Geral</span>
              </button>
            </div>

            {/* CONTROL PANEL: SEARCH & FILTERS */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-6" id="filters_panel">
              <div className="flex flex-col gap-4">
                {/* Search input with search icon indicator */}
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5 animate-pulse" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar medicamento (ex: Acetilcisteína, Vancomicina, etc. ou observações clínicas)..."
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-slate-900 pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm sm:text-base placeholder:text-slate-400"
                    id="search_input"
                  />
                </div>

                <div className="border-t border-slate-100 pt-4" id="advanced_filters">
                  {/* Administration route filter */}
                  <div className="max-w-md">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-500" />
                      Via de Administração
                    </label>
                    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl" id="filter_route">
                      {['Todos', 'EV', 'IM', 'SC', 'INAL'].map((via) => (
                        <button
                          key={via}
                          onClick={() => setSelectedRoute(via)}
                          className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${
                            selectedRoute === via
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                          }`}
                        >
                          {via}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS AND LISTING COUNT */}
            <div className="flex items-center justify-between pb-1 inline-flex w-full" id="search_results_header">
              <p className="text-sm font-semibold text-slate-600">
                Mostrando <span className="text-blue-600 font-bold">{filteredMedicamentos.length}</span> medicamentos filtrados
              </p>
              {searchQuery || selectedRoute !== 'Todos' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRoute('Todos');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar Filtros
                </button>
              ) : null}
            </div>

            {filteredMedicamentos.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center"
                id="no_results"
              >
                <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4 inline-flex">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Nenhum injetável encontrado</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md">
                  Verifique os termos digitados ou refine a busca ajustando o filtro de via.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRoute('Todos');
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Restaurar Filtros
                  </button>
                  {/* Removed custom registration button as per clinical instructions */}
                </div>
              </motion.div>
            ) : (
              /* CARD CONTAINER GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="meds_grid">
                <AnimatePresence mode="popLayout">
                  {filteredMedicamentos.map((med) => {
                    // Color schemes for different categories
                    let categoryColor = 'bg-blue-50 text-blue-800 border-blue-200';
                    if (med.categoria === 'Antibióticos') {
                      categoryColor = 'bg-rose-50 text-rose-800 border-rose-200';
                    } else if (med.categoria === 'Analgésicos e Sedativos') {
                      categoryColor = 'bg-purple-50 text-purple-800 border-purple-200';
                    } else if (med.categoria === 'Cardiovasculares') {
                      categoryColor = 'bg-amber-50 text-amber-800 border-amber-200';
                    } else if (med.categoria === 'Antídotos e Antieméticos') {
                      categoryColor = 'bg-teal-50 text-teal-800 border-teal-200';
                    }

                    return (
                      <motion.div
                        layout
                        key={med.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden relative"
                        id={`card_${med.id}`}
                      >
                        {/* Custom label indicator */}
                        {med.customizado && (
                          <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl tracking-wider uppercase border-l border-b border-blue-200/50 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            Institucional
                          </div>
                        )}

                        <div className="p-5 flex-1">
                          {/* Title and Badge */}
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug uppercase">
                              {med.nome}
                            </h2>
                            {!med.customizado && (
                              <span className={`text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-lg border uppercase whitespace-nowrap ${categoryColor}`}>
                                {med.categoria.split(' ')[0]}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-medium italic mb-4 leading-relaxed">
                            {med.forma}
                          </p>

                          {/* Action badges for vias */}
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {med.vias.map((via) => (
                              <span
                                key={via}
                                className="bg-slate-100/80 text-slate-800 border border-slate-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider"
                              >
                                {via}
                              </span>
                            ))}
                          </div>

                          {/* Compact previews */}
                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="text-[13px] leading-relaxed">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-blue-500" />
                                Tempo de Infusão:
                              </span>
                              <p className="text-slate-600 pl-5 font-mono text-[12px] whitespace-pre-line">{med.tempo}</p>
                            </div>

                            <div className="text-[13px] leading-relaxed">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <FlaskConical className="w-4 h-4 text-emerald-500" />
                                Diluição Recomendada:
                              </span>
                              <p className="text-slate-600 pl-5 font-medium whitespace-pre-line">{med.diluicao}</p>
                            </div>
                          </div>
                        </div>

                        {/* Card bottom actions bar */}
                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setSelectedMed(med);
                              setCalc({
                                volume: med.volumePadraoMl || 100,
                                tempoHoras: 0,
                                tempoMinutos: med.tempoPadraoMinutos || 60,
                                usarMinutos: true,
                              });
                              setAplicarCalculadora(false);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-blue-100/50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Ficha Completa
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {med.customizado && (
                            <button
                              onClick={() => handleDeleteMed(med.id, med.nome)}
                              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remover Medicamento de Local"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {currentView === 'sonda' && (
          <div className="space-y-6" id="view_sonda">
            
            {/* BACK BAR TO PORTAL */}
            <div className="flex items-center justify-between pb-1" id="back_navigation_bar_sonda">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#0c3366] shrink-0" />
                <span>Voltar ao Portal Geral</span>
              </button>
            </div>

            {/* CONTROL PANEL: SEARCH & COMPATIBILITY FILTERS */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-6" id="filters_panel_sonda">
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5 animate-pulse" />
                  </span>
                  <input
                    type="text"
                    value={searchQuerySonda}
                    onChange={(e) => setSearchQuerySonda(e.target.value)}
                    placeholder="Buscar medicamento via sonda (ex: Acetilcisteína, Metoclopramida, etc.)..."
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-slate-900 pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm sm:text-base placeholder:text-slate-400"
                    id="search_input_sonda"
                  />
                </div>

                <div className="border-t border-slate-100 pt-4" id="advanced_filters_sonda">
                  <div className="max-w-xl">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-500" />
                      Compatibilidade com Sonda Enteral / Gástrica
                    </label>
                    <div className="flex flex-wrap sm:flex-nowrap gap-1.5 bg-slate-100 p-1 rounded-xl" id="filter_sonda_status">
                      {[
                        { label: 'Todos', value: 'Todos' },
                        { label: 'Compatível (Sim)', value: 'Sim' },
                        { label: 'Restrito', value: 'Restrito' },
                        { label: 'Contraindicado (Não)', value: 'Não' }
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setSelectedSondaFilter(item.value as any)}
                          className={`flex-1 text-center py-1.5 px-2 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${
                            selectedSondaFilter === item.value
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SAFETY PREPARATION STEPS */}
            <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 sm:p-5 flex gap-3 text-xs leading-relaxed text-blue-900" id="sonda_intro_card">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold uppercase tracking-wider block mb-1 text-[#0c3366]">
                  Protocolo Geral de Preparo via Sonda (ISCAL)
                </strong>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li><strong>Trituração:</strong> Triturar um comprimido por vez até virar pó fino. Nunca misturar os fármacos no mesmo copo de preparo.</li>
                  <li><strong>Diluição:</strong> Diluir completamente o pó em 15 a 30 mL de Água Destilada ou deionizada antes de aplicar.</li>
                  <li><strong>Lavagem de Segurança:</strong> Lavar a sonda enteral com 20 mL de água purificada imediatamente antes e após administrar qualquer medicamento oral.</li>
                </ul>
              </div>
            </div>

            {/* RESULTS AND LISTING COUNT */}
            <div className="flex items-center justify-between pb-1 inline-flex w-full" id="search_results_header_sonda">
              <p className="text-sm font-semibold text-slate-600">
                Mostrando <span className="text-[#0c3366] font-bold">{filteredMedicamentosSonda.length}</span> medicamentos filtrados via sonda
              </p>
              {searchQuerySonda || selectedSondaFilter !== 'Todos' ? (
                <button
                  onClick={() => {
                    setSearchQuerySonda('');
                    setSelectedSondaFilter('Todos');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-[#0c3366] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar Filtros
                </button>
              ) : null}
            </div>

            {filteredMedicamentosSonda.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center"
                id="no_results_sonda"
              >
                <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4 inline-flex">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Nenhum medicamento encontrado para sonda</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md">
                  Tente alterar os termos de busca ou selecione outro nível de compatibilidade acima.
                </p>
              </motion.div>
            ) : (
              /* CARD CONTAINER GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="meds_grid_sonda">
                <AnimatePresence mode="popLayout">
                  {filteredMedicamentosSonda.map((med) => {
                    let compatibilityBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    let compatibilityLabel = 'Sem Restrições';
                    
                    if (med.sonda === 'Não') {
                      compatibilityBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                      compatibilityLabel = 'Contraindicado';
                    } else if (med.sonda === 'Restrito') {
                      compatibilityBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                      compatibilityLabel = 'Restrito';
                    }

                    return (
                      <motion.div
                        layout
                        key={med.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-350 transition-all flex flex-col justify-between overflow-hidden relative animate-fade-in"
                        id={`card_sonda_${med.id}`}
                      >
                        <div className="p-5 flex-1 flex flex-col">
                          
                          {/* Title and Badge */}
                          <div className="flex justify-between items-start gap-3 mb-1.5 animate-pulse-once">
                            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug uppercase">
                              {med.ativo}
                            </h2>
                            <span className={`text-[10px] font-black tracking-wide px-2.5 py-1 rounded-lg border uppercase whitespace-nowrap shrink-0 ${compatibilityBadgeColor}`}>
                              {compatibilityLabel}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-[11px] text-slate-500 font-medium italic">
                              {med.forma}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                              Ref: {med.comercial}
                            </span>
                          </div>

                          {/* Guidelines details */}
                          <div className="space-y-3.5 pt-3 border-t border-slate-100 flex-1">
                            
                            {med.preparoComprimido !== 'X' && (
                              <div className="text-[13px] leading-relaxed">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                  Preparo de Comprimidos:
                                </span>
                                <p className="text-slate-600 pl-3.5 text-[12.5px] leading-snug mt-0.5 font-medium">{med.preparoComprimido}</p>
                              </div>
                            )}

                            {med.preparoLiquido !== 'X' && (
                              <div className="text-[13px] leading-relaxed">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                  Preparo de Líquidos:
                                </span>
                                <p className="text-slate-600 pl-3.5 text-[12.5px] leading-snug mt-0.5 font-medium">{med.preparoLiquido}</p>
                              </div>
                            )}

                            {med.recomendacoes !== '-' && (
                              <div className="text-[13px] leading-relaxed">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  Orientações Gerais:
                                </span>
                                <p className="text-slate-500 pl-3.5 text-[12px] leading-snug mt-0.5 italic font-medium">{med.recomendacoes}</p>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Card bottom actions bar */}
                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedSondaMed(med)}
                            className="text-xs font-bold text-blue-600 hover:text-[#0c3366] inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-blue-100/50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-blue-700" />
                            <span>Ver Ficha Técnica</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {currentView === 'calculadoras' && (
          <CalculadorasModulo onBackToHome={() => setCurrentView('home')} />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800" id="main_footer_bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-1">
              <span>👨‍⚕️</span> Manual Farmacêutico Digital
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Guia Clínico e Protocolos Auxiliares para Administração Segura de Medicamentos Injetáveis Adultos.
            </p>
          </div>
          <div className="text-xs text-slate-500 text-center sm:text-right">
            <p>&copy; {new Date().getFullYear()} Manual Hospitalar de Injetáveis.</p>
            <p className="mt-0.5 font-semibold text-slate-400">Desenvolvido com Rigor Clínico e Foco em Segurança do Paciente</p>
          </div>
        </div>
      </footer>

      {/* MODAL: FULL MED DETAILS OVERLAY */}
      <AnimatePresence>
        {selectedMed && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="details_modal">
            {/* Backdrop overlay trigger */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMed(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-w-2xl w-full relative z-10"
              >
                
                {/* Header detail */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-850 text-white px-6 py-5 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md font-extrabold tracking-wider uppercase block w-max mb-2">
                        {selectedMed.categoria}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-snug">
                        {selectedMed.nome}
                      </h3>
                      <p className="text-blue-100 text-xs mt-1 italic font-medium">
                        {selectedMed.forma}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMed(null)}
                      className="text-white hover:text-sky-200 bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Content Rows */}
                <div className="p-6 space-y-5">
                  
                  {/* Grid elements */}
                  <div className="space-y-4">
                    
                    {/* Permitted routes */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Vias Permitidas
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedMed.vias.map((v) => {
                          const desc = getViaDescription(v);
                          return (
                            <span
                              key={v}
                              className="bg-indigo-50 text-indigo-850 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-indigo-250/40 inline-flex items-center gap-1.5"
                            >
                              <span>{v}</span>
                              {desc && (
                                <span className="text-[10px] text-indigo-600/75 font-medium italic lowercase normal-case">
                                  ({desc})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  <div className="space-y-4 pt-1">
                    
                    {/* Dose usual details */}
                    <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed">
                      <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                        <Activity className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="col-span-11">
                        <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                          Dose Usual Adulto
                        </span>
                        <p className="text-slate-600 text-[13px] mt-0.5 whitespace-pre-line">{selectedMed.dose}</p>
                      </div>
                    </div>

                    {/* Reconstitution details */}
                    <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed">
                      <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                        <RotateCcw className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="col-span-11">
                        <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                          Reconstituição (Preparo inicial do Liofilizado)
                        </span>
                        <p className="text-slate-600 text-[13px] mt-0.5 whitespace-pre-line">{selectedMed.reconstituicao}</p>
                      </div>
                    </div>

                    {/* Dilution details */}
                    <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed">
                      <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                        <FlaskConical className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="col-span-11">
                        <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                          Diluição Recomendada e Fluídos Compatíveis
                        </span>
                        <p className="text-slate-600 text-[13px] mt-0.5 font-medium whitespace-pre-line">{selectedMed.diluicao}</p>
                      </div>
                    </div>

                    {/* Infusion time detail */}
                    <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed">
                      <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                        <Clock className="w-5 h-5 text-sky-500" />
                      </div>
                      <div className="col-span-11">
                        <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                          Tempo de Infusão / Velocidade de Administração
                        </span>
                        <p className="text-slate-600 text-[13px] mt-0.5 font-mono whitespace-pre-line">{selectedMed.tempo}</p>
                      </div>
                    </div>

                    {/* Stability details */}
                    <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed">
                      <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="col-span-11">
                        <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                          Estabilidade Química do Preparo
                        </span>
                        <p className="text-slate-600 text-[13px] mt-0.5 whitespace-pre-line">{selectedMed.estabilidade}</p>
                      </div>
                    </div>

                    {/* Observations warning alert box */}
                    {selectedMed.observacoes && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex gap-3 text-xs leading-relaxed text-yellow-900 mt-4">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold uppercase tracking-wider block mb-0.5 text-yellow-950">
                            Notas Clínicas e Contraindicações Importantes:
                          </strong>
                          <div className="whitespace-pre-line mt-1">{selectedMed.observacoes}</div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Infusion Calculator Option */}
                    <div className="border-t border-slate-100 pt-5 mt-5" id="modal_calculator_section">
                      <button
                        type="button"
                        onClick={() => setAplicarCalculadora(!aplicarCalculadora)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider ${
                          aplicarCalculadora
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        id="toggle_calculator_button"
                      >
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          <span>Aplicar na Calculadora de Infusão</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                          aplicarCalculadora ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {aplicarCalculadora ? 'Ativado (Ver abaixo)' : 'Clique para Ativar'}
                        </span>
                      </button>

                      {aplicarCalculadora && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            {/* Volume */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Volume Total (mL)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={calc.volume || ''}
                                  onChange={(e) => setCalc({ ...calc, volume: Math.max(0, Number(e.target.value)) })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-mono"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                                  mL
                                </span>
                              </div>
                            </div>

                            {/* Time */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Tempo (Minutos)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={calc.tempoMinutos || ''}
                                  onChange={(e) => setCalc({ ...calc, tempoMinutos: Math.max(0, Number(e.target.value)) })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-mono"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">
                                  min
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* AUTOMATIC INFUSION RESULTS SECTION */}
                          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3" id="modal_calc_results">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300 border-b border-white/10 pb-1.5 mb-2 block">
                              📌 Resultados da Infusão (Calculados Automaticamente)
                            </h4>
                            
                            <div className="grid grid-cols-1 gap-2.5">
                              {/* Row 1: BIC */}
                              <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg text-xs border border-white/5">
                                <div>
                                  <span className="block font-semibold text-emerald-400">Bomba de Infusão (BIC)</span>
                                  <span className="text-[10px] text-slate-400">Taxa de infusão volumétrica</span>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="text-base font-black text-white">{calcResults.mlHora}</span>
                                  <span className="text-[10px] text-slate-300 ml-1 font-bold">mL/h</span>
                                </div>
                              </div>

                              {/* Row 2: Gotas */}
                              <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg text-xs border border-white/5">
                                <div>
                                  <span className="block font-semibold text-sky-450">Equipo Macrogotas</span>
                                  <span className="text-[10px] text-slate-400">Gravitacional (20 gts = 1mL)</span>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="text-base font-black text-white">{calcResults.gotasMin}</span>
                                  <span className="text-[10px] text-slate-300 ml-1 font-bold">gts/min</span>
                                </div>
                              </div>

                              {/* Row 3: Microgotas */}
                              <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg text-xs border border-white/5">
                                <div>
                                  <span className="block font-semibold text-sky-400">Equipo Microgotas</span>
                                  <span className="text-[10px] text-slate-400">Gravitacional (60 mcgts = 1mL)</span>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="text-base font-black text-white">{calcResults.microgotasMin}</span>
                                  <span className="text-[10px] text-slate-300 ml-1 font-bold">mcgts/min</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-[9px] text-slate-400 font-mono pt-1 text-center font-bold">
                              Parâmetro: {calc.volume} mL / {calc.tempoMinutos} min ({(calc.tempoMinutos / 60).toFixed(2)} h)
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                  </div>

                </div>

                {/* Footer and dismiss */}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
                  <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                    ID: {selectedMed.id}
                  </div>
                  <button
                    onClick={() => {
                      setAplicarCalculadora(!aplicarCalculadora);
                    }}
                    className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      aplicarCalculadora ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    {aplicarCalculadora ? 'Ocultar Calculadora' : 'Aplicar na Calculadora'}
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}

        {selectedSondaMed && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="sonda_details_modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSondaMed(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-w-xl w-full relative z-10"
              >
                
                {/* Header detail */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-850 text-white px-6 py-5 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md font-extrabold tracking-wider uppercase block w-max mb-2">
                        Administração via Sonda (ISCAL)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-snug">
                        {selectedSondaMed.ativo}
                      </h3>
                      <p className="text-blue-100 text-xs mt-1 italic font-medium">
                        Apresentação: {selectedSondaMed.forma}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSondaMed(null)}
                      className="text-white hover:text-sky-200 bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-5">
                  
                  {/* Nome Comercial Box */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                      Nomes Comerciais de Referência
                    </span>
                    <p className="text-slate-800 font-bold text-sm">{selectedSondaMed.comercial}</p>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Compatibility */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Geral na Sonda:</span>
                      {selectedSondaMed.sonda === 'Não' ? (
                        <span className="text-xs font-black text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg uppercase">
                          Contraindicado
                        </span>
                      ) : selectedSondaMed.sonda === 'Restrito' ? (
                        <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg uppercase">
                          Restrito / Com restrições
                        </span>
                      ) : (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg uppercase">
                          Compatível / Sem restrições
                        </span>
                      )}
                    </div>

                    {/* Preparo Comprimidos */}
                    {selectedSondaMed.preparoComprimido !== 'X' && (
                      <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed border-t border-slate-100 pt-3">
                        <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                          <Pill className="w-5 h-5 text-indigo-500 hover:scale-110 transition-transform" />
                        </div>
                        <div className="col-span-11">
                          <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                            Preparo de Comprimidos
                          </span>
                          <p className="text-slate-600 text-[13px] mt-0.5 font-medium leading-relaxed">
                            {selectedSondaMed.preparoComprimido}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Preparo Líquidos */}
                    {selectedSondaMed.preparoLiquido !== 'X' && (
                      <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed border-t border-slate-100 pt-3">
                        <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                          <FlaskConical className="w-5 h-5 text-sky-500" />
                        </div>
                        <div className="col-span-11">
                          <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                            Preparo de Líquidos / Suspensões
                          </span>
                          <p className="text-slate-600 text-[13px] mt-0.5 font-medium leading-relaxed">
                            {selectedSondaMed.preparoLiquido}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Orientecoes Gerais / Recomendacoes */}
                    {selectedSondaMed.recomendacoes !== '-' && (
                      <div className="grid grid-cols-12 gap-2 text-sm leading-relaxed border-t border-slate-100 pt-3">
                        <div className="col-span-1 flex justify-center text-slate-400 mt-0.5">
                          <Info className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="col-span-11">
                          <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                            Recomendações e Orientações Gerais
                          </span>
                          <p className="text-slate-500 text-[12.5px] mt-0.5 italic font-medium leading-relaxed">
                            {selectedSondaMed.recomendacoes}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Safety Card Section */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs leading-relaxed text-slate-700">
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      <ShieldAlert className="w-4 h-4 text-slate-700" />
                      Protocolo Geral de Segurança (ISCAL)
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 font-medium text-slate-600">
                      <li>Triturar individualmente no copo de dose (nunca misturar antes).</li>
                      <li>Fazer flush de 20mL de água destilada para limpar a sonda antes e depois de administrar.</li>
                      <li>Sugerir suspender a nutrição enteral se houver risco de interação física.</li>
                    </ul>
                  </div>

                </div>

                {/* Footer and dismiss */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
                  <button
                    onClick={() => setSelectedSondaMed(null)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Fechar Ficha
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}

        {selectedUpcomingModule && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="upcoming_module_modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUpcomingModule(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-w-md w-full relative z-10 p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-[#0c3366] flex items-center justify-center mb-4 shadow-sm">
                  <selectedUpcomingModule.icon className="w-8 h-8 stroke-[1.8]" />
                </div>
                
                <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full mb-2">
                  {selectedUpcomingModule.tag}
                </span>

                <h3 className="text-xl font-extrabold text-slate-900 uppercase">
                  {selectedUpcomingModule.title}
                </h3>
                <p className="text-xs font-bold text-[#0c3366] mb-3">
                  {selectedUpcomingModule.subtitle}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 px-2">
                  {selectedUpcomingModule.desc}
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full mb-6 text-left">
                  <span className="text-[10px] font-extrabold text-[#0c3366] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <span>🔄</span> Plano de Desenvolvimento ISCAL
                  </span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Este software está sendo atualizado em conformidade com as diretrizes de farmácia clínica do ISCAL. Este módulo estará disponível no próximo lote de implantação hospitalar local.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUpcomingModule(null)}
                  className="w-full py-3 bg-[#0c3366] text-white hover:bg-[#0c3366]/90 active:scale-98 text-xs font-bold uppercase tracking-wider rounded-xl transition-all font-mono"
                >
                  Entendi, fechar
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
