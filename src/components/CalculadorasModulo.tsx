import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Minus,
  Info,
  Sparkles,
  RefreshCw,
  Check,
  Clock,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AprazamentoModulo from './AprazamentoModulo';

interface CalculadorasModuloProps {
  onBackToHome: () => void;
}

export default function CalculadorasModulo({ onBackToHome }: CalculadorasModuloProps) {
  const [selectedCalc, setSelectedCalc] = useState<'aprazamento' | 'padua'>('aprazamento');

  // Padua State
  const [isClinico, setIsClinico] = useState<boolean | null>(null);
  const [cancerAtivo, setCancerAtivo] = useState(false);
  const [tevPrevio, setTevPrevio] = useState(false);
  const [mobilidadeReduzida, setMobilidadeReduzida] = useState(false);
  const [trombofilia, setTrombofilia] = useState(false);
  const [traumaCirurgia, setTraumaCirurgia] = useState(false);
  const [idade70, setIdade70] = useState(false);
  const [insuficienciaCardioResp, setInsuficienciaCardioResp] = useState(false);
  const [iam_avc, setIam_avc] = useState(false);
  const [infeccaoReuma, setInfeccaoReuma] = useState(false);
  const [obesidade, setObesidade] = useState(false);
  const [terapiaHormonal, setTerapiaHormonal] = useState(false);

  // Clear all Padua choices
  const handleResetPadua = () => {
    setIsClinico(null);
    setCancerAtivo(false);
    setTevPrevio(false);
    setMobilidadeReduzida(false);
    setTrombofilia(false);
    setTraumaCirurgia(false);
    setIdade70(false);
    setInsuficienciaCardioResp(false);
    setIam_avc(false);
    setInfeccaoReuma(false);
    setObesidade(false);
    setTerapiaHormonal(false);
  };

  // Calculate Padua Score
  const calculatePaduaScore = () => {
    let score = 0;
    if (cancerAtivo) score += 3;
    if (tevPrevio) score += 3;
    if (mobilidadeReduzida) score += 3;
    if (trombofilia) score += 3;
    if (traumaCirurgia) score += 2;
    if (idade70) score += 1;
    if (insuficienciaCardioResp) score += 1;
    if (iam_avc) score += 1;
    if (infeccaoReuma) score += 1;
    if (obesidade) score += 1;
    if (terapiaHormonal) score += 1;
    return score;
  };

  const totalScore = calculatePaduaScore();
  const isHighRisk = totalScore >= 4;

  return (
    <div className="space-y-6" id="calculadoras_modulo_main">
      {/* Top Banner Navigation/Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm" id="calc_top_bar">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHome}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700 shrink-0 border border-transparent hover:border-slate-200"
            title="Voltar ao Portal Principal"
            id="btn_calc_back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#0c3366] leading-none">Apoio Decisional Clinico</h2>
            <p className="text-xs text-slate-400 mt-1">Escores de risco validados e otimização de fluxos.</p>
          </div>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200/50 self-start sm:self-center w-full sm:w-auto" id="calc_tab_switcher">
          <button
            onClick={() => setSelectedCalc('aprazamento')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedCalc === 'aprazamento'
                ? 'bg-[#0c3366] text-white shadow-md shadow-blue-900/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            id="tab_btn_aprazamento"
          >
            <Clock className="w-4 h-4" />
            <span>Aprazamento Técnico</span>
          </button>
          <button
            onClick={() => setSelectedCalc('padua')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedCalc === 'padua'
                ? 'bg-[#0c3366] text-white shadow-md shadow-blue-900/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            id="tab_btn_padua"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Escore de Pádua (Risco TEV)</span>
          </button>
        </div>
      </div>

      {/* Main Feature Container */}
      <AnimatePresence mode="wait">
        {selectedCalc === 'aprazamento' && (
          <motion.div
            key="aprazamento_view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <AprazamentoModulo onBackToHome={onBackToHome} embedded={true} />
          </motion.div>
        )}

        {selectedCalc === 'padua' && (
          <motion.div
            key="padua_view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            id="padua_view_container"
          >
            {/* Left Panel: Criteria Group */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/60 p-6 space-y-6 shadow-sm" id="padua_left_panel">
              
              {/* Step 1: clinical applicability confirmation */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-4" id="padua_applicability_box">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-blue-100 rounded-xl text-blue-800 shrink-0 mt-0.5">
                    <Info className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">1. Confirmação de Aplicabilidade Clínica</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      O Escore de Pádua é validado especificamente para avaliar a necessidade de profilaxia contra Tromboembolismo Venoso (TEV) em pacientes clínicos sob internação.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 pt-3" id="applicability_check">
                  <span className="text-xs font-bold text-slate-600 block mb-2.5">O paciente sob avaliação é um paciente clínico hospitalizado?</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsClinico(true)}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        isClinico === true
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      id="opt_clinico_sim"
                    >
                      <Check className={`w-4 h-4 ${isClinico === true ? 'opacity-100' : 'opacity-0'}`} />
                      <span>Sim, paciente clínico hospitalizado</span>
                    </button>
                    <button
                      onClick={() => setIsClinico(false)}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        isClinico === false
                          ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      id="opt_clinico_nao"
                    >
                      <AlertTriangle className={`w-4 h-4 ${isClinico === false ? 'opacity-100' : 'opacity-0'}`} />
                      <span>Não (Não aplicável)</span>
                    </button>
                  </div>
                </div>

                {isClinico === false && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed"
                    id="applicability_warning"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      <strong>Aviso de Limitação:</strong> O escore de Pádua foi calibrado e validado unicamente para pacientes clínicos hospitalizados. Ele <strong>não se aplica</strong> a pacientes essencialmente cirúrgicos ou em cenário exclusivamente ambulatorial de triagem.
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Step 2: Scoring List Factors */}
              <div className="space-y-4" id="padua_factor_groups">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>2. Avaliação de Fatores de Risco</span>
                    <span className="text-[10px] font-normal text-slate-400 font-mono tracking-wide">(Selecione todos os aplicáveis)</span>
                  </h3>
                  <button
                    onClick={handleResetPadua}
                    className="text-xs text-slate-400 hover:text-[#0c3366] flex items-center gap-1 transition-colors font-semibold"
                    id="btn_reset_padua"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                </div>

                {/* Factors list sorted by points */}
                <div className="space-y-3" id="factors_list">

                  {/* 3 Points Category Accent */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                      Fatores de Alto Impacto (3 Pontos cada)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {/* Active Cancer */}
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          cancerAtivo 
                            ? 'bg-rose-50/40 border-rose-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_cancer_ativo"
                      >
                        <input
                          type="checkbox"
                          checked={cancerAtivo}
                          onChange={(e) => setCancerAtivo(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Câncer Ativo</span>
                          <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                            Metástases locais/à distância e/ou quimioterapia/radioterapia nos últimos 6 meses.
                          </span>
                        </div>
                      </label>

                      {/* Previous VTE */}
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          tevPrevio 
                            ? 'bg-rose-50/40 border-rose-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_tev_previo"
                      >
                        <input
                          type="checkbox"
                          checked={tevPrevio}
                          onChange={(e) => setTevPrevio(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">TEV Prévio</span>
                          <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                            Histórico documentado de Trombose Venosa Profunda (TVP) ou Tromboembolismo Pulmonar (TEP).
                          </span>
                        </div>
                      </label>

                      {/* Reduced mobility */}
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          mobilidadeReduzida 
                            ? 'bg-rose-50/40 border-rose-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_mobilidade_reduzida"
                      >
                        <input
                          type="checkbox"
                          checked={mobilidadeReduzida}
                          onChange={(e) => setMobilidadeReduzida(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Mobilidade Reduzida</span>
                          <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                            Repouso em leito com permissão apenas para ir ao banheiro por ≥ 3 dias consecutivos.
                          </span>
                        </div>
                      </label>

                      {/* Known thrombophilia */}
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          trombofilia 
                            ? 'bg-rose-50/40 border-rose-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_trombofilia"
                      >
                        <input
                          type="checkbox"
                          checked={trombofilia}
                          onChange={(e) => setTrombofilia(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Trombofilia Conhecida</span>
                          <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                            Presença de mutações genéticas (ex: Fator V de Leiden) ou deforntes anticoagulantes naturais.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 2 Points Category Accent */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                      Fatores de Impacto Moderado (2 Pontos)
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {/* Trauma/surgery */}
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          traumaCirurgia 
                            ? 'bg-amber-50/30 border-amber-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_trauma_cirurgia"
                      >
                        <input
                          type="checkbox"
                          checked={traumaCirurgia}
                          onChange={(e) => setTraumaCirurgia(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-amber-700 border-slate-300 focus:ring-amber-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Trauma e/ou Cirurgia Recente</span>
                          <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                            Ocorrido em tempo inferior ou igual a 1 mês (≤ 1 mês).
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 1 Point Category Accent */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0c3366] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                      Fatores de Impacto Geral (1 Ponto cada)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      
                      {/* Age >= 70 */}
                      <label 
                        className={`flex items-start gap-3 p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          idade70 
                            ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_idade70"
                      >
                        <input
                          type="checkbox"
                          checked={idade70}
                          onChange={(e) => setIdade70(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Idade ≥ 70 Anos</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Paciente com 70 anos completos ou mais.</span>
                        </div>
                      </label>

                      {/* heart/respiratory failure */}
                      <label 
                        className={`flex items-start gap-3 p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          insuficienciaCardioResp 
                            ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_cardio_resp"
                      >
                        <input
                          type="checkbox"
                          checked={insuficienciaCardioResp}
                          onChange={(e) => setInsuficienciaCardioResp(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Insuficiência Cardíaca ou Respiratória</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Graus clinicamente descompensados ou com suporte ativo.</span>
                        </div>
                      </label>

                      {/* acute stroke / MI */}
                      <label 
                        className={`flex items-start gap-3 p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          iam_avc 
                            ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_iam_avc"
                      >
                        <input
                          type="checkbox"
                          checked={iam_avc}
                          onChange={(e) => setIam_avc(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Infarto Agudo ou AVC Isquêmico</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Infarto Agudo do Miocárdio (IAM) ou Acidente Vascular Cerebral Isquêmico.</span>
                        </div>
                      </label>

                      {/* acute infection / rheumatology */}
                      <label 
                        className={`flex items-start gap-3 p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          infeccaoReuma 
                            ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_infeccao_reuma"
                      >
                        <input
                          type="checkbox"
                          checked={infeccaoReuma}
                          onChange={(e) => setInfeccaoReuma(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Infecção ou Doença Reumática Aguda</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Infecção bacteriana/viral ou surto agudo reumático em curso.</span>
                        </div>
                      </label>

                      {/* obesity */}
                      <label 
                        className={`flex items-start gap-3 p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          obesidade 
                            ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_obesidade"
                      >
                        <input
                          type="checkbox"
                          checked={obesidade}
                          onChange={(e) => setObesidade(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Obesidade (IMC ≥ 30)</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Índice de Massa Corporal superior ou igual a 30 kg/m².</span>
                        </div>
                      </label>

                      {/* hormone therapy */}
                      <label 
                        className={`flex items-start gap-3 p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          terapiaHormonal 
                            ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                        id="label_hormonal"
                      >
                        <input
                          type="checkbox"
                          checked={terapiaHormonal}
                          onChange={(e) => setTerapiaHormonal(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Terapia Hormonal em Curso</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Uso de estrogênio, contracepção combinada ou reposições hormonais.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Result & Interpretation */}
            <div className="lg:col-span-4 space-y-6" id="padua_right_panel">
              {/* Score Display Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden" id="padua_score_card">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-rose-500" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Pontuação Total Pádua</span>
                
                {/* Massive Animated Score */}
                <div className="relative my-3 flex items-center justify-center">
                  <span className={`text-6xl font-black font-mono tracking-tight leading-none ${
                    isHighRisk ? 'text-rose-600' : 'text-emerald-600'
                  }`} id="score_number">
                    {totalScore}
                  </span>
                  <span className="text-slate-300 text-lg font-bold ml-1">/ 20</span>
                </div>

                {/* Risk Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold leading-none mb-4 ${
                  isHighRisk 
                    ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`} id="risk_evaluation_badge">
                  {isHighRisk ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Alto Risco (≥ 4 de pontuação)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Baixo Risco (0 - 3 de pontuação)</span>
                    </>
                  )}
                </div>

                {/* Interpretation Alert Block */}
                <div className="w-full text-left bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs leading-relaxed" id="textual_interpretation">
                  {isHighRisk ? (
                    <div className="space-y-3">
                      <span className="font-extrabold text-rose-800 text-[11px] uppercase tracking-wider block">Recomendação Clínica:</span>
                      <p className="text-slate-600">
                        O total é <strong>{totalScore}</strong>. Por ser <strong className="text-rose-800">Alto Risco (≥4)</strong>, pacientes desta coorte que não receberam profilaxia farmacológica apresentaram taxas elevadas de complicação em 90 dias.
                      </p>
                      <div className="bg-rose-100/50 p-3 rounded-xl border border-rose-200/40 text-rose-900 leading-normal text-[11px]">
                        <strong>Conduta Sugerida:</strong> Recomenda-se fortemente a instituição de profilaxia farmacológica padrão (Ex: Enoxaparina 40mg SC x1/dia ou Heparina não fracionada 5000 UI SC 8/8h), observando possíveis contraindicações formais ou sangramento ativo.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="font-extrabold text-emerald-800 text-[11px] uppercase tracking-wider block">Análise de Risco:</span>
                      <p className="text-slate-600">
                        O total é <strong>{totalScore}</strong>. Por possuir risco inferior a 4, o paciente se enquadra na faixa de <strong className="text-emerald-800">Baixo Risco</strong>.
                      </p>
                      <div className="bg-emerald-100/30 p-2.5 rounded-xl border border-emerald-200/20 text-emerald-950 font-medium">
                        De acordo com as diretrizes, não há benefício líquido demonstrado com profilaxia sistêmica medicamentosa para este nível. Estimular deambulação ativa e avaliar novamente em caso de novos fatores clínico-laboratoriais.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Based Box */}
              <div className="bg-[#0c3366]/5 border border-[#0c3366]/10 rounded-2xl p-4.5 space-y-3.5" id="padua_evidence_box">
                <div className="flex items-center gap-2 text-[#0c3366] font-bold text-xs" id="evidence_title">
                  <Sparkles className="w-4 h-4" />
                  <span>Embasamento Clínico (Padua RAM)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Estudo de coorte de Barbar et al. demonstrou que pacientes de <strong>vulnerabilidade elevada (Padua ≥ 4)</strong> sem profilaxia medicamentosa tiveram incidência de <strong>11% de eventos tromboembólicos venosos sintomáticos em 90 dias</strong>, reduzida para apenas <strong>2,2%</strong> nos que foram submetidos à profilaxia (<span className="font-semibold text-[#0c3366]">HR 0,13; IC 95% 0,04–0,40</span>).
                </p>
                <div className="border-t border-slate-200/50 pt-2.5 text-[10px] text-slate-400 italic leading-snug">
                  Barbar S, Noventa F, Rossetto V, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. <em>J Thromb Haemost</em>. 2010.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
