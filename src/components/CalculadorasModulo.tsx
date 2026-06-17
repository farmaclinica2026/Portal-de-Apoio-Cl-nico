import { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calculator, 
  CheckCircle2, 
  Plus, 
  Minus,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AprazamentoModulo from './AprazamentoModulo';

interface CalculadorasModuloProps {
  onBackToHome: () => void;
}

export default function CalculadorasModulo({ onBackToHome }: CalculadorasModuloProps) {
  const [selectedCalc, setSelectedCalc] = useState<'padua' | 'aprazamento' | null>(null);

  // Padua State
  const [step1Confirmed, setStep1Confirmed] = useState<boolean | null>(null);
  
  // Criteria State
  const [cancerAtivo, setCancerAtivo] = useState(false);
  const [tevPrevio, setTevPrevio] = useState(false);
  const [mobilidadeReduzida, setMobilidadeReduzida] = useState(false);
  const [trombofiliaConhecida, setTrombofiliaConhecida] = useState(false);
  const [traumaCirurgia, setTraumaCirurgia] = useState(false);
  const [idadeSetenta, setIdadeSetenta] = useState(false);
  const [insuficienciaCardioResp, setInsuficienciaCardioResp] = useState(false);
  const [iamAvc, setIamAvc] = useState(false);
  const [infeccaoReuma, setInfeccaoReuma] = useState(false);
  const [obesidade, setObesidade] = useState(false);
  const [terapiaHormonal, setTerapiaHormonal] = useState(false);

  // Calculate Padua Score
  const calculatePaduaScore = () => {
    let score = 0;
    
    // 3 points
    if (cancerAtivo) score += 3;
    if (tevPrevio) score += 3;
    if (mobilidadeReduzida) score += 3;
    if (trombofiliaConhecida) score += 3;
    
    // 2 points
    if (traumaCirurgia) score += 2;
    
    // 1 point
    if (idadeSetenta) score += 1;
    if (insuficienciaCardioResp) score += 1;
    if (iamAvc) score += 1;
    if (infeccaoReuma) score += 1;
    if (obesidade) score += 1;
    if (terapiaHormonal) score += 1;
    
    return score;
  };

  const totalScore = calculatePaduaScore();
  const isHighRisk = totalScore >= 4;

  const handleReset = () => {
    setStep1Confirmed(null);
    setCancerAtivo(false);
    setTevPrevio(false);
    setMobilidadeReduzida(false);
    setTrombofiliaConhecida(false);
    setTraumaCirurgia(false);
    setIdadeSetenta(false);
    setInsuficienciaCardioResp(false);
    setIamAvc(false);
    setInfeccaoReuma(false);
    setObesidade(false);
    setTerapiaHormonal(false);
  };

  const handleSwitch = (calc: 'padua' | 'aprazamento' | null) => {
    // Sempre limpar o cache clínico e local storage para manter a privacidade do paciente
    handleReset();
    localStorage.removeItem('meds_standalone');
    localStorage.removeItem('safetyGap_standalone');
    localStorage.removeItem('daysToShow_standalone');
    localStorage.removeItem('strategy_standalone');
    localStorage.removeItem('snapMode_standalone');
    localStorage.removeItem('tolerance_standalone');
    localStorage.removeItem('schedulingMode_standalone');
    setSelectedCalc(calc);
  };

  return (
    <div className="space-y-6" id="view_calculadoras">
      {/* BACK BAR TO PORTAL */}
      <div className="flex items-center justify-between pb-1" id="back_navigation_bar_calcs">
        <button
          onClick={selectedCalc ? () => handleSwitch(null) : onBackToHome}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 text-[#0c3366] shrink-0" />
          <span>{selectedCalc ? 'Voltar para Calculadoras' : 'Voltar ao Portal Geral'}</span>
        </button>

        <div className="text-xs bg-[#0c3366]/5 border border-[#0c3366]/10 text-[#0c3366] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5" id="header_indicator">
          <Calculator className="w-4 h-4" />
          <span>Calculadoras Clínicas</span>
        </div>
      </div>

      {/* COMPONENT BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {selectedCalc === null ? (
          <div className="lg:col-span-12 space-y-8 py-4">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-sm font-extrabold text-[#0c3366] uppercase tracking-widest flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>Escolha um Módulo de Suporte</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Clique em uma das ferramentas descritas abaixo para inicializar os parâmetros. O cache e os registros de pacientes anteriores são purgados automaticamente a cada consulta para garantir a segurança dos dados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Card Escore de Pádua */}
              <motion.button
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSwitch('padua')}
                className="bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-slate-100 border border-slate-200 rounded-3xl p-6 text-left cursor-pointer transition-all flex flex-col justify-between h-56 group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/10">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                      Escore de Pádua (Risco TEV)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-semibold">
                      Avaliação sistematizada e validada para estratificação de risco de Tromboembolismo Venoso em pacientes clínicos hospitalizados.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 mt-4">
                  <span>Abrir ferramenta de análise</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.button>

              {/* Card Aprazamento Técnico */}
              <motion.button
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSwitch('aprazamento')}
                className="bg-white hover:border-teal-500 hover:shadow-lg hover:shadow-slate-100 border border-slate-200 rounded-3xl p-6 text-left cursor-pointer transition-all flex flex-col justify-between h-56 group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0c3366] to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/10">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors text-sm">
                      Aprazamento Técnico
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-semibold">
                      Algoritmo matemático e técnico para elaboração de horários e escala de infusão de antimicrobianos livre de conflitos físicos ou químicos.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-teal-600 mt-4">
                  <span>Abrir gerenciador de horários</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            {/* Left Column: List/Tab of Calculators or Config */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4" id="calcs_menu_card">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0c3366] mb-3 px-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Calculadoras</span>
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSwitch('padua')}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-bold flex items-center justify-between group ${
                      selectedCalc === 'padua'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 shrink-0" />
                      <span>Escore de Pádua (Risco TEV)</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedCalc === 'padua' ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
                  </button>

                  <button
                    onClick={() => handleSwitch('aprazamento')}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-bold flex items-center justify-between group ${
                      selectedCalc === 'aprazamento'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Aprazamento Técnico</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedCalc === 'aprazamento' ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
                  </button>

                  <div className="border-t border-slate-100 pt-1.5 mt-1.5">
                    <button
                      onClick={() => handleSwitch(null)}
                      className="w-full text-left p-2 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all text-[11px] font-bold flex items-center gap-1.5 justify-center cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                      <span>Menu de Calculadoras</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-tr from-[#0c3366]/5 to-sky-50 rounded-2xl border border-[#0c3366]/10 p-4.5 space-y-2">
                <h4 className="text-xs font-extrabold text-[#0c3366] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#0c3366]" />
                  <span>Aviso Importante</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  As calculadoras fornecidas servem como suporte à atividade clínica, mas não substituem o julgamento independente e soberano do profissional de saúde responsável.
                </p>
              </div>
            </div>

            {/* Right Column: Active Calculator */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {selectedCalc === 'padua' && (
                  <motion.div
                    key="padua_tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-3xl shadow-xs border border-slate-200 p-5 md:p-6 space-y-6"
                    id="padua_calculator_panel"
                  >
                {/* Header of Calc */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      <span>Escore de Pádua (Padua Prediction Score)</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Modelo validado de avaliação de risco para Tromboembolismo Venoso (TEV) em pacientes clínicos hospitalizados.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleReset}
                    className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                </div>

                {/* STEP 1: Confirmation of Applicability */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 space-y-3" id="padua_step_1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0c3366]">
                        Confirmação de Aplicabilidade Clínica
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        O paciente avaliado é um <strong>paciente clínico hospitalizado</strong>? (Este escore não se destina a pacientes cirúrgicos ou diagnóstico ambulatorial prévio de TEV).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pl-7 mt-2">
                    <button
                      onClick={() => setStep1Confirmed(true)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        step1Confirmed === true
                          ? 'bg-[#0c3366] text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Sim, paciente clínico hospitalizado
                    </button>
                    <button
                      onClick={() => setStep1Confirmed(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        step1Confirmed === false
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Não/Outro tipo
                    </button>
                  </div>

                  {step1Confirmed === false && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mt-2 flex gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Aviso Clínico:</strong> O escore de Pádua foi validado e calibrado especificamente para pacientes clínicos hospitalizados. A aplicação em outras populações pode levar a sub ou super-estimativa do risco.
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 2: Criteria Assessment */}
                <div className="space-y-4" id="padua_step_2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0c3366]">
                      Marque cada fator de risco ativo presente
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* CRITÉRIOS DE 3 PONTOS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>Fatores de Alto Risco</span>
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">3 Pontos Cada</span>
                      </h4>

                      <div className="space-y-2.5">
                        {/* Cancer Ativo */}
                        <label className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={cancerAtivo}
                            onChange={(e) => setCancerAtivo(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Câncer ativo</span>
                            <span className="text-slate-500 text-[10px] block leading-snug">Metástases e/ou quimioterapia/radioterapia nos últimos 6 meses.</span>
                          </div>
                        </label>

                        {/* TEV Prévio */}
                        <label className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={tevPrevio}
                            onChange={(e) => setTevPrevio(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 block">TEV Prévio</span>
                            <span className="text-slate-500 text-[10px] block leading-snug">Histórico prévio de TVP ou TEP.</span>
                          </div>
                        </label>

                        {/* Mobilidade Reduzida */}
                        <label className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={mobilidadeReduzida}
                            onChange={(e) => setMobilidadeReduzida(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Mobilidade reduzida</span>
                            <span className="text-slate-500 text-[10px] block leading-snug">Restrição ao leito com deambulação permitida apenas ao banheiro por ≥3 dias.</span>
                          </div>
                        </label>

                        {/* Trombofilia Conhecida */}
                        <label className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={trombofiliaConhecida}
                            onChange={(e) => setTrombofiliaConhecida(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 block">Trombofilia conhecida</span>
                            <span className="text-slate-500 text-[10px] block leading-snug">Fator V de Leiden, mutações, deficiência de antitrombina, SAF.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* CRITÉRIOS DE 1 E 2 PONTOS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>Fatores Moderados e Adicionais</span>
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">1 a 2 Pontos</span>
                      </h4>

                      <div className="space-y-2.5">
                        {/* Trauma ou Cirurgia Recente (2 pontos) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={traumaCirurgia}
                            onChange={(e) => setTraumaCirurgia(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Trauma ou cirurgia recente (≤1 mês)</span>
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">2 pts</span>
                            </span>
                          </div>
                        </label>

                        {/* Idade >= 70 (1 ponto) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={idadeSetenta}
                            onChange={(e) => setIdadeSetenta(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Idade ≥70 anos</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">1 pt</span>
                            </span>
                          </div>
                        </label>

                        {/* Insuficiência cardíaca ou respiratória (1 ponto) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={insuficienciaCardioResp}
                            onChange={(e) => setInsuficienciaCardioResp(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Insuficiência cardíaca ou respiratória</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">1 pt</span>
                            </span>
                          </div>
                        </label>

                        {/* IAM ou AVC (1 ponto) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={iamAvc}
                            onChange={(e) => setIamAvc(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>IAM agudo ou AVC isquêmico</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">1 pt</span>
                            </span>
                          </div>
                        </label>

                        {/* Infecção aguda ou doença reumatológica (1 ponto) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={infeccaoReuma}
                            onChange={(e) => setInfeccaoReuma(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Infecção aguda e/ou doença reumatológica</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">1 pt</span>
                            </span>
                          </div>
                        </label>

                        {/* Obesidade (1 ponto) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={obesidade}
                            onChange={(e) => setObesidade(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Obesidade (IMC ≥30 kg/m²)</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">1 pt</span>
                            </span>
                          </div>
                        </label>

                        {/* Terapia hormonal (1 ponto) */}
                        <label className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={terapiaHormonal}
                            onChange={(e) => setTerapiaHormonal(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 border-slate-300 mt-0.5 cursor-pointer" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Terapia hormonal em curso</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-extrabold font-mono">1 pt</span>
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

                {/* STEP 3 & 4: Result and Practical Actions */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-slate-150" id="padua_results_and_actions">
                  
                  {/* Score Display */}
                  <div className="md:col-span-5 flex flex-col justify-center items-center p-6 rounded-2xl border text-center transition-all bg-slate-50 border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Pontuação Total</span>
                    <span className={`text-5xl font-black font-mono tracking-tight leading-none mb-1.5 ${
                      isHighRisk ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {totalScore}
                    </span>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 shadow-2xs ${
                      isHighRisk 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isHighRisk ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Alto Risco</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Baixo Risco</span>
                        </>
                      )}
                    </span>

                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-4">Ponto de Corte</span>
                    <span className="text-[10px] text-slate-600 font-medium">Alto Risco quando ≥ 4 pontos</span>
                  </div>

                  {/* Recommendation Actions */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        3
                      </span>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0c3366]">
                        Ação Prática Vinculada ao Risco
                      </h3>
                    </div>

                    <div className={`p-4 rounded-2xl border leading-relaxed text-xs transition-all ${
                      isHighRisk
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}>
                      {isHighRisk ? (
                        <div className="space-y-2.5">
                          <p className="font-bold flex items-center gap-1">
                            <span className="text-rose-600 text-base">🚨</span>
                            <span>INDICAÇÃO DE PROFILAXIA FARMACOLÓGICA</span>
                          </p>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            A coorte que embasa a aplicação do Padua mostrou que pacientes de <strong className="text-slate-900">Alto Risco (≥4)</strong> que não receberam profilaxia apresentaram uma taxa de <strong>11% de TEV em 90 dias</strong>, comparado a apenas <strong>2,2%</strong> nos que receberam (<span className="font-semibold text-[#0c3366]">HR 0,13; IC95% 0,04–0,40</span>).
                          </p>
                          <p className="text-[10px] text-rose-900 font-bold bg-rose-100/50 p-2 rounded-xl border border-rose-200/20">
                            Recomenda-se instituir profilaxia medicamentosa (heparina, enoxaparina, etc.) caso não haja contraindicações clínicas ou risco ativo de sangramento.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-bold flex items-center gap-1 text-emerald-800">
                            <span className="text-emerald-600 text-base">✓</span>
                            <span>BAIXO RISCO DE TROMBOEMBOLISMO</span>
                          </p>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            A taxa de eventos em pacientes de <strong className="text-slate-900">Baixo Risco (0–3)</strong> sem profilaxia medicamentosa é estatisticamente insignificante na coorte de derivação, não justificando o risco associado ao uso de anticoagulantes.
                          </p>
                          <p className="text-[10px] text-emerald-900 font-bold bg-emerald-100/30 p-2 rounded-xl border border-emerald-200/10">
                            <strong>Conduta Recomendada:</strong> Profilaxia farmacológica geralmente não indicada. Priorize e incentive a mobilização precoce, hidratação adequada e acompanhamento rotineiro.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Note */}
                <div className="text-[10px] text-slate-400 font-sans space-y-2 pt-3 border-t border-slate-100 leading-relaxed text-left">
                  <span className="font-extrabold uppercase tracking-wider text-[8.5px] block text-slate-500 mb-1">Referências Bibliográficas Recomendadas:</span>
                  <div className="pl-3 border-l-2 border-slate-200 space-y-1 text-[9.5px]">
                    <p>
                      <strong>1.</strong> Schünemann HJ, Cushman M, Burnett AE, Kahn SR, Beyer-Westendorf J, Spencer FA, Rezende SM, Zakai NA, Bauer KA, Dentali F, Lansing J, Balduzzi S, Darzi A, Morgano GP, Neumann I, Nieuwlaat R, Yepes-Nuñez JJ, Zhang Y, Wiercioch W. Diretrizes da American Society of Hematology 2018 para manejo do tromboembolismo venoso: profilaxia para pacientes hospitalizados e não hospitalizados. <em>Blood Adv.</em> 2018 27 de novembro; 2(22):3198-3225. doi: 10.1182/bloodadvances.2018022954. Errato em: Blood Adv. 2023 09 de maio; 7(9):1671. PMID: 30482763; PMCID: PMC6258910.
                    </p>
                    <p>
                      <strong>2.</strong> Barbar S, Noventa F, Rossetto V, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. <em>Journal of Thrombosis and Haemostasis</em>. 2010;8(11):2450-2457. doi:10.1111/j.1538-7836.2010.04044.x.
                    </p>
                  </div>
                </div>

              </motion.div>
            )}

            {selectedCalc === 'aprazamento' && (
              <motion.div
                key="aprazamento_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AprazamentoModulo onBackToHome={onBackToHome} embedded={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    )}
      </div>
    </div>
  );
}
