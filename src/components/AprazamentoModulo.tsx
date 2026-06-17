import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Activity, 
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sliders,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ANTIMICROBIALS_DATA, ANTIMICROBIALS, FREQUENCIES } from '../dataAprazamento';

export interface PrescribedMed {
  id: string;
  name: string;
  modeIndex: number;
  duration: number;
  durationUnit: string;
  frequencyHours: number;
  days: number;
  priority: string;
  preferredTime?: string;
}

interface Dose {
  medId: string;
  drug: string;
  modeLabel: string;
  startMin: number;
  endMin: number;
  originalStartMin: number;
  day: number;
  delayMin: number;
  isCoinciding: boolean;
}

interface AprazamentoResults {
  success: boolean;
  doses: Dose[];
  warnings: string[];
  viabilityScore: number;
  metrics: {
    density: number;
    totalChoques: number;
    totalSimultaneos: number;
    avgDelay: number;
  };
  errorMsg?: string;
}

interface AprazamentoModuloProps {
  onBackToHome: () => void;
  embedded?: boolean;
}

interface SampleDose {
  start: number;
  end: number;
}

const generateMedsDoses = (
  med: PrescribedMed, 
  startOffset: number, 
  daysToShow: number
): SampleDose[] => {
  const doses: SampleDose[] = [];
  const interval = med.frequencyHours * 60;
  const durationInMin = med.durationUnit === 'h' ? med.duration * 60 : med.duration;
  
  for (let d = 0; d < daysToShow; d++) {
    if (d >= med.days) continue;
    
    for (let t = 0; t < 1440; t += interval) {
      const parentStart = d * 1440 + startOffset + t;
      doses.push({
        start: parentStart,
        end: parentStart + durationInMin
      });
    }
  }
  return doses;
};

const isOverlapping = (
  doseA: SampleDose, 
  doseB: SampleDose, 
  gap: number
): boolean => {
  return doseA.start < (doseB.end + gap) && doseB.start < (doseA.end + gap);
};

const findDisjointScheduleMeds = (
  medsList: PrescribedMed[],
  gap: number,
  days: number,
  snap: string
): Record<string, number> | null => {
  if (medsList.length === 0) return {};

  const sortedMeds = [...medsList].sort((a, b) => {
    const fixedA = a.preferredTime ? 1 : 0;
    const fixedB = b.preferredTime ? 1 : 0;
    if (fixedA !== fixedB) return fixedB - fixedA;
    const pA = a.priority === 'high' ? 1 : 0;
    const pB = b.priority === 'high' ? 1 : 0;
    return pB - pA;
  });

  const assignments: Record<string, number> = {};
  const activeDosesByMed: Record<string, SampleDose[]> = {};

  const offsetStep = (snap === 'hour') ? 60 : 30;
  const candidates: number[] = [];
  for (let min = 0; min < 1440; min += offsetStep) {
    candidates.push(min);
  }

  // Sort candidates starting near 08:00 (480 min) for nice clinical times
  candidates.sort((a, b) => {
    const distA = (a >= 480) ? (a - 480) : (a + 1440 - 480);
    const distB = (b >= 480) ? (b - 480) : (b + 1440 - 480);
    return distA - distB;
  });

  let steps = 0;
  const MAX_STEPS = 1000;

  const backtrack = (index: number): boolean => {
    steps++;
    if (steps > MAX_STEPS) {
      return false; // Safely abort to avoid freezing the browser on complex or unsolvable schedules
    }

    if (index === sortedMeds.length) {
      return true;
    }

    const med = sortedMeds[index];
    
    if (med.preferredTime) {
      const fixedOffset = toMinutes(med.preferredTime);
      const doses = generateMedsDoses(med, fixedOffset, days);
      
      let hasOverlap = false;
      for (const assignedMedId of Object.keys(assignments)) {
        const assignedDoses = activeDosesByMed[assignedMedId];
        for (const dA of doses) {
          for (const dB of assignedDoses) {
            if (isOverlapping(dA, dB, gap)) {
              hasOverlap = true;
              break;
            }
          }
          if (hasOverlap) break;
        }
        if (hasOverlap) break;
      }

      if (!hasOverlap) {
        assignments[med.id] = fixedOffset;
        activeDosesByMed[med.id] = doses;
        if (backtrack(index + 1)) return true;
        delete assignments[med.id];
        delete activeDosesByMed[med.id];
      }
      return false;
    }

    for (const cand of candidates) {
      const doses = generateMedsDoses(med, cand, days);
      
      let hasOverlap = false;
      for (const assignedMedId of Object.keys(assignments)) {
        const assignedDoses = activeDosesByMed[assignedMedId];
        for (const dA of doses) {
          for (const dB of assignedDoses) {
            if (isOverlapping(dA, dB, gap)) {
              hasOverlap = true;
              break;
            }
          }
          if (hasOverlap) break;
        }
        if (hasOverlap) break;
      }

      if (!hasOverlap) {
        assignments[med.id] = cand;
        activeDosesByMed[med.id] = doses;
        if (backtrack(index + 1)) return true;
        delete assignments[med.id];
        delete activeDosesByMed[med.id];
      }
    }

    return false;
  };

  if (backtrack(0)) {
    return assignments;
  }
  return null;
};

const toMinutes = (timeStr: string) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return 480; // default fallback 08:00
  }
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) {
    return 480;
  }
  return h * 60 + m;
};

const formatClock = (totalMinutes: number) => {
  const minutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function AprazamentoModulo({ onBackToHome, embedded = false }: AprazamentoModuloProps) {
  const [meds, setMeds] = useState<PrescribedMed[]>(() => {
    const saved = localStorage.getItem('meds_standalone');
    return saved ? JSON.parse(saved) : [];
  });
  const globalStart = '08:00';
  const [safetyGap, setSafetyGap] = useState<number>(() => {
    const saved = localStorage.getItem('safetyGap_standalone');
    return saved ? Number(saved) : 0;
  });
  const [daysToShow, setDaysToShow] = useState<number>(() => {
    const saved = localStorage.getItem('daysToShow_standalone');
    return saved ? Number(saved) : 3;
  });
  const [strategy, setStrategy] = useState<string>(() => {
    const saved = localStorage.getItem('strategy_standalone');
    return saved || 'auto';
  });
  const [snapMode, setSnapMode] = useState<string>(() => {
    const saved = localStorage.getItem('snapMode_standalone');
    return saved || 'hour';
  });
  const [tolerance, setTolerance] = useState<number>(() => {
    const saved = localStorage.getItem('tolerance_standalone');
    return saved ? Number(saved) : 0;
  });
  const [schedulingMode, setSchedulingMode] = useState<string>(() => {
    const saved = localStorage.getItem('schedulingMode_standalone');
    return saved || 'automatic';
  });
  const [result, setResult] = useState<AprazamentoResults | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([1, 2, 3]);

  // Save state to localstorage
  useEffect(() => { localStorage.setItem('meds_standalone', JSON.stringify(meds)); }, [meds]);
  useEffect(() => { localStorage.setItem('safetyGap_standalone', String(safetyGap)); }, [safetyGap]);
  useEffect(() => { localStorage.setItem('daysToShow_standalone', String(daysToShow)); }, [daysToShow]);
  useEffect(() => { localStorage.setItem('strategy_standalone', strategy); }, [strategy]);
  useEffect(() => { localStorage.setItem('snapMode_standalone', snapMode); }, [snapMode]);
  useEffect(() => { localStorage.setItem('tolerance_standalone', String(tolerance)); }, [tolerance]);
  useEffect(() => { localStorage.setItem('schedulingMode_standalone', schedulingMode); }, [schedulingMode]);

  // Core Calculation engine
  const calculateSchedule = (
    currentMeds: PrescribedMed[], 
    globalStartStr: string, 
    gap: number,
    days: number,
    strat: string,
    snap: string = 'none',
    tol: number = 30,
    schedMode: string = 'automatic'
  ): AprazamentoResults => {
    if (strat === 'auto' && schedMode === 'automatic') {
      const solvedAssignments = findDisjointScheduleMeds(currentMeds, gap, days, snap);
      
      if (solvedAssignments) {
        const optimizedMeds = currentMeds.map(m => {
          const offsetMin = solvedAssignments[m.id];
          const h = Math.floor(offsetMin / 60).toString().padStart(2, '0');
          const mPart = (offsetMin % 60).toString().padStart(2, '0');
          return {
            ...m,
            preferredTime: `${h}:${mPart}`
          };
        });
        
        const res = calculateSchedule(optimizedMeds, "08:00", gap, days, 'fixed', snap, tol, 'automatic');
        return {
          ...res,
          viabilityScore: 100,
          success: true
        };
      } else {
        return {
          success: false,
          doses: [],
          warnings: ["🚨 Não é possível realizar o aprazamento automático pois haverá infusão simultânea."],
          viabilityScore: 0,
          metrics: {
            density: 0,
            totalChoques: 1,
            totalSimultaneos: 1,
            avgDelay: 0
          },
          errorMsg: "Não é possível realizar o aprazamento automático pois haverá infusão simultânea"
        };
      }
    }

    const globalStartMin = globalStartStr ? toMinutes(globalStartStr) : 480;
    const warnings: string[] = [];
    const allDoses: Dose[] = [];
    
    currentMeds.forEach(med => {
      const interval = med.frequencyHours * 60;
      const startOffset = med.preferredTime ? toMinutes(med.preferredTime) : globalStartMin;
      const durationInMin = med.durationUnit === 'h' ? med.duration * 60 : med.duration;
      const mode = ANTIMICROBIALS_DATA[med.name]?.modes[med.modeIndex] || { label: "N/A", durationMin: durationInMin };
      
      for (let d = 0; d < days; d++) {
        if (d >= med.days) continue;
        
        for (let t = 0; t < 1440; t += interval) {
          let absoluteStart = d * 1440 + startOffset + t;
          
          if (snap === 'hour') {
            absoluteStart = Math.round(absoluteStart / 60) * 60;
          } else if (snap === 'half') {
            absoluteStart = Math.round(absoluteStart / 30) * 30;
          }

          allDoses.push({
            medId: med.id,
            drug: med.name,
            modeLabel: mode.label,
            startMin: absoluteStart,
            endMin: absoluteStart + durationInMin,
            originalStartMin: absoluteStart,
            day: d + 1,
            delayMin: 0,
            isCoinciding: false
          });
        }
      }
    });

    allDoses.sort((a, b) => {
      if (a.startMin !== b.startMin) {
        return a.startMin - b.startMin;
      }
      const medA = currentMeds.find(m => m.id === a.medId);
      const medB = currentMeds.find(m => m.id === b.medId);

      const pA = medA ? (medA.priority === 'high' ? 1 : 0) : 0;
      const pB = medB ? (medB.priority === 'high' ? 1 : 0) : 0;
      if (pA !== pB) return pB - pA;

      const prefA = medA ? (medA.preferredTime ? 1 : 0) : 0;
      const prefB = medB ? (medB.preferredTime ? 1 : 0) : 0;
      if (prefA !== prefB) return prefB - prefA;

      return 0;
    });
    
    const resolvedDoses: Dose[] = [];
    let lastEndMin = -Infinity;

    for (let i = 0; i < allDoses.length; i++) {
      const dose = allDoses[i];
      const med = currentMeds.find(m => m.id === dose.medId);
      const isFixed = med ? !!med.preferredTime : false;
      
      let actualStart = dose.startMin;
      if (schedMode === 'automatic' && !isFixed) {
        actualStart = Math.max(dose.startMin, lastEndMin + gap);
        
        if (snap === 'hour') {
          let snapped = Math.round(actualStart / 60) * 60;
          if (snapped < lastEndMin + gap) {
            snapped = Math.ceil(actualStart / 60) * 60;
          }
          actualStart = snapped;
        } else if (snap === 'half') {
          let snapped = Math.round(actualStart / 30) * 30;
          if (snapped < lastEndMin + gap) {
            snapped = Math.ceil(actualStart / 30) * 30;
          }
          actualStart = snapped;
        }
      }

      const duration = dose.endMin - dose.startMin;
      const delay = actualStart - dose.startMin;
      
      const resolved: Dose = {
        ...dose,
        startMin: actualStart,
        endMin: actualStart + duration,
        delayMin: delay,
        isCoinciding: false
      };

      resolvedDoses.push(resolved);
      
      if (schedMode === 'automatic') {
        lastEndMin = isFixed ? Math.max(lastEndMin, resolved.endMin) : resolved.endMin;
      }
    }

    const overlapsGrouped: Record<string, boolean> = {};
    
    resolvedDoses.forEach((dA, i) => {
      let coincided = false;
      resolvedDoses.forEach((dB, j) => {
        if (i === j) return;
        if (dA.day !== dB.day) return;

        const overlap = dA.startMin < (dB.endMin + gap) && dB.startMin < (dA.endMin + gap);
        if (overlap) {
          coincided = true;
          
          const key = [dA.day, dA.drug, dB.drug].sort().join('|');
          if (!overlapsGrouped[key]) {
            overlapsGrouped[key] = true;
            warnings.push(
              `⚠️ <strong>Conflito (Dia ${dA.day}):</strong> Infusão simultânea entre <strong>${dA.drug}</strong> (${formatClock(dA.startMin)} - ${formatClock(dA.endMin)}) e <strong>${dB.drug}</strong> (${formatClock(dB.startMin)} - ${formatClock(dB.endMin)}) no mesmo período.`
            );
          }
        }
      });
      dA.isCoinciding = coincided;
    });

    const adjustmentWarnings: string[] = [];
    resolvedDoses.forEach((d) => {
      if (d.delayMin > 0) {
        adjustmentWarnings.push(
          `⏱️ <strong>Ajuste (Dia ${d.day}):</strong> Dose de <strong>${d.drug}</strong> postergada em <strong>${d.delayMin} min</strong> para manter segurança (Desejado: ${formatClock(d.originalStartMin)} → Praticado: ${formatClock(d.startMin)}).`
        );
      }
    });

    warnings.push(...adjustmentWarnings);

    let totalChoques = 0;
    let totalSimultaneos = 0;
    let invalidDoses = 0;
    
    resolvedDoses.forEach((d, i) => {
      if (schedMode === 'automatic') {
        if (d.delayMin > 0) totalChoques++;
      } else {
        if (d.isCoinciding) totalChoques++;
      }
      
      if (d.delayMin > tol) {
        invalidDoses++;
        warnings.push(`🚨 <strong>Tolerância Excedida (Dia ${d.day}):</strong> Dose de <strong>${d.drug}</strong> excede a tolerância máxima definida (${d.delayMin} min vs limite de ${tol} min).`);
      }
      
      if (i > 0 && d.originalStartMin === resolvedDoses[i-1].originalStartMin) {
        totalSimultaneos++;
      }
    });

    let score = 100;
    score -= (totalChoques * 5);      
    score -= (totalSimultaneos * 10); 
    score -= (invalidDoses * 50);
    
    const viabilityScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      success: invalidDoses === 0,
      doses: resolvedDoses,
      warnings,
      viabilityScore,
      metrics: {
        density: 0,
        totalChoques,
        totalSimultaneos,
        avgDelay: resolvedDoses.length > 0 ? (resolvedDoses.reduce((acc, d) => acc + d.delayMin, 0) / resolvedDoses.length) : 0
      }
    };
  };

  useEffect(() => {
    if (meds.length > 0) {
      const res = calculateSchedule(meds, globalStart, safetyGap, daysToShow, strategy, snapMode, tolerance, schedulingMode);
      setResult(res);
    } else {
      setResult(null);
    }
  }, [meds, globalStart, safetyGap, daysToShow, strategy, snapMode, tolerance, schedulingMode]);

  useEffect(() => {
    setExpandedDays(Array.from({ length: daysToShow }, (_, i) => i + 1));
  }, [daysToShow]);

  const gapRisk = useMemo(() => {
    const totalOccupiedMin = meds.reduce((acc, m) => {
      const dosesPerDay = 24 / m.frequencyHours;
      const duration = m.durationUnit === 'h' ? m.duration * 60 : m.duration;
      return acc + (dosesPerDay * duration);
    }, 0);
    const density = totalOccupiedMin / 1440;
    
    if (safetyGap === 0) return { label: 'Crítico', color: 'text-rose-600 bg-rose-50 border-rose-100', prob: '95%' };
    if (safetyGap < 15 && density > 0.7) return { label: 'Alto', color: 'text-rose-600 bg-rose-50 border-rose-100', prob: '70%' };
    if (safetyGap >= 15 && density < 0.5) return { label: 'Seguro', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', prob: '5%' };
    return { label: 'Médio', color: 'text-amber-600 bg-amber-50 border-amber-100', prob: '35%' };
  }, [meds, safetyGap]);

  const toggleDay = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addMed = () => {
    const defaultMedName = ANTIMICROBIALS[0].name;
    const newMed: PrescribedMed = {
      id: Math.random().toString(36).substring(2, 11),
      name: defaultMedName,
      modeIndex: 0,
      duration: ANTIMICROBIALS_DATA[defaultMedName].modes[0].durationMin,
      durationUnit: 'min',
      frequencyHours: 8,
      days: 7,
      priority: 'normal',
      preferredTime: undefined
    };
    setMeds([...meds, newMed]);
  };

  const removeMed = (id: string) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const updateMed = (id: string, updates: Partial<PrescribedMed>) => {
    setMeds(meds.map(m => m.id === id ? { ...m, ...updates } as PrescribedMed : m));
  };

  const handleReset = () => {
    setMeds([]);
    setSafetyGap(0);
    setDaysToShow(3);
    setStrategy('auto');
    setSnapMode('hour');
    setTolerance(0);
    setResult(null);
    setExpandedDays([1, 2, 3]);
  };

  const totalChoques = result?.metrics?.totalChoques || 0;
  const totalSimultaneos = result?.metrics?.totalSimultaneos || 0;

  return (
    <div className="space-y-6" id="view_aprazamento">
      {/* Back button and title toolbar */}
      <div className={`flex flex-col md:flex-row items-stretch md:items-center ${embedded ? 'justify-end' : 'justify-between'} gap-4 pb-2`} id="back_navigation_bar_aprazamento">
        {!embedded && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Voltar ao Portal Geral</span>
          </button>
        )}

        {/* Real-time Config Panel / Right Header side */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full md:w-auto text-left">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Modo de Aprazamento</label>
            <div className="flex bg-slate-100 p-1 rounded-xl h-[38px] items-center">
              <button 
                onClick={() => setSchedulingMode('automatic')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all h-[30px] ${schedulingMode === 'automatic' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Auto
              </button>
              <button 
                onClick={() => setSchedulingMode('manual')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all h-[30px] ${schedulingMode === 'manual' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Manual
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Período (Dias)</label>
            <select 
              value={daysToShow}
              onChange={(e) => setDaysToShow(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer h-[38px]"
            >
              {[1, 2, 3, 5, 7, 10, 14].map(v => <option key={v} value={v}>{v} {v === 1 ? 'dia' : 'dias'}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Arredondamento</label>
            <select 
              value={snapMode}
              onChange={(e) => setSnapMode(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer h-[38px]"
            >
              <option value="none">Padrão livre</option>
              <option value="hour">Horas Cheias</option>
              <option value="half">Meias Horas</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Tolerância (min)</label>
            <select 
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer h-[38px]"
            >
              <option value={0}>Sem tolerância</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
          <div className="flex flex-col col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gap de Segurança</label>
              <div className="flex items-center gap-1">
                <input 
                  type="checkbox" 
                  checked={safetyGap > 0} 
                  onChange={(e) => setSafetyGap(e.target.checked ? 15 : 0)}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[9px] font-black text-slate-400 uppercase">On</span>
              </div>
            </div>
            <select 
              disabled={safetyGap === 0}
              value={safetyGap}
              onChange={(e) => setSafetyGap(Number(e.target.value))}
              className={`w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer h-[38px] ${safetyGap === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {[5, 10, 15, 20, 30, 45, 60].map(v => <option key={v} value={v}>{v} min</option>)}
              {safetyGap === 0 && <option value="0">Desativado</option>}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-3 rounded-2xl border border-slate-250">
            <span className="font-bold text-slate-800 text-sm">Lista de Antimicrobianos</span>
            <div className="flex items-center gap-2">
              {meds.length > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm("Deseja apagar os medicamentos atualmente prescritos para aprazamento?")) {
                      setMeds([]);
                      setResult(null);
                    }
                  }}
                  className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-1 bg-white border border-slate-200 px-2 py-1.5 rounded-lg shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                onClick={addMed}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Fármaco
              </button>
            </div>
          </div>

          {/* Meds List */}
          <div className="space-y-3">
            {meds.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Nenhum fármaco adicionado. Clique em "+ Fármaco" para começar a estruturar o cronograma do paciente.
                </p>
              </div>
            ) : (
              meds.map((med, index) => (
                <div 
                  key={med.id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 relative hover:border-blue-350 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-[9px] font-black text-blue-700">
                        #{index + 1}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#0c3366] uppercase tracking-wider">Antimicrobiano Prescrito</span>
                    </div>
                    <button 
                      onClick={() => removeMed(med.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all p-1.5 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Nome Comercial/Ativo</label>
                        <select 
                          value={med.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const modes = ANTIMICROBIALS_DATA[name].modes;
                            updateMed(med.id, { 
                              name, 
                              modeIndex: 0, 
                              duration: modes[0].durationMin, 
                              durationUnit: 'min' 
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                        >
                          {ANTIMICROBIALS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Tempo/Via Padrão</label>
                        <select 
                          value={med.modeIndex}
                          onChange={(e) => {
                            const idx = Number(e.target.value);
                            const duration = ANTIMICROBIALS_DATA[med.name].modes[idx].durationMin;
                            updateMed(med.id, { modeIndex: idx, duration, durationUnit: 'min' });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                        >
                          {ANTIMICROBIALS_DATA[med.name].modes.map((m, i) => (
                            <option key={i} value={i}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Frequência</label>
                        <select 
                          value={med.frequencyHours}
                          onChange={(e) => updateMed(med.id, { frequencyHours: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 outline-none"
                        >
                          {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Dias</label>
                        <select 
                          value={med.days}
                          onChange={(e) => updateMed(med.id, { days: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 outline-none"
                        >
                          {[1, 2, 3, 4, 5, 7, 10, 14, 21, 28].map(d => <option key={d} value={d}>{d} d</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Prioridade</label>
                        <select 
                          value={med.priority}
                          onChange={(e) => updateMed(med.id, { priority: e.target.value })}
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 outline-none ${med.priority === 'high' ? 'border-amber-300 bg-amber-50 text-amber-900' : ''}`}
                        >
                          <option value="normal">Comum</option>
                          <option value="high">Restrita/Alta</option>
                        </select>
                      </div>
                    </div>

                    {/* Duration and Pref Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Duração da Infusão</label>
                        <div className="flex gap-1 items-center">
                          <input 
                            type="number" 
                            value={med.duration}
                            onChange={(e) => updateMed(med.id, { duration: Number(e.target.value) })}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 font-mono text-xs font-black text-slate-800 outline-none"
                          />
                          <select
                            value={med.durationUnit}
                            onChange={(e) => updateMed(med.id, { durationUnit: e.target.value })}
                            className="bg-slate-100 border-none rounded-xl px-2 py-2 text-[9px] font-bold uppercase text-slate-600 outline-none cursor-pointer"
                          >
                            <option value="min">min</option>
                            <option value="h">hs</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Início Preferencial</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="checkbox" 
                              checked={!!med.preferredTime} 
                              onChange={(e) => updateMed(med.id, { preferredTime: e.target.checked ? '08:00' : undefined })}
                              className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[8px] font-black text-slate-400 uppercase">Fixar</span>
                          </div>
                        </div>
                        <input 
                          type="time" 
                          disabled={!med.preferredTime}
                          value={med.preferredTime || ""}
                          onChange={(e) => updateMed(med.id, { preferredTime: e.target.value })}
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs font-black text-slate-800 outline-none ${!med.preferredTime ? 'opacity-40 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={handleReset}
            className="w-full py-2.5 border border-slate-250 text-slate-500 bg-white hover:bg-slate-50 rounded-xl font-medium text-xs tracking-wide transition-all active:scale-98"
          >
            Restaurar Configurações Padrão
          </button>
        </div>

        {/* Right Column: Visualization / Results Panel */}
        <div className="lg:col-span-7">
          {result ? (
            result.errorMsg ? (
              <div className="bg-white rounded-3xl shadow-xs border border-rose-200 p-6 md:p-8 space-y-6 min-h-[400px] flex flex-col justify-center relative overflow-hidden animate-fade-in" id="aprazamento_error_view">
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-2 shadow-xs">
                  <ShieldAlert className="w-9 h-9" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Incompatibilidade de Rota</h3>
                  <div className="p-4 bg-rose-50/65 border border-rose-150 rounded-2xl">
                    <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                      🚨 {result.errorMsg}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    O algoritmo de aprazamento técnico testou exaustivamente todas as combinações de horários de início de infusão de modo a garantir janelas de tempo totalmente disjuntas (sem nenhuma concorrência), porém as restrições clínicas atuais inviabilizam uma rota limpa.
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Recomendações Clínicas:</span>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                    <li><strong className="text-slate-800">Reduza a Margem de Segurança:</strong> Tente reduzir ou desativar o Gap de Segurança se estiver utilizando um valor alto.</li>
                    <li><strong className="text-slate-800">Use Horários Manuais:</strong> Alterne para o <b>Modo Manual</b> no cabeçalho acima para arranjar os horários diretamente.</li>
                    <li><strong className="text-slate-800">Transição de Via de Administração:</strong> Contate a equipe médica para avaliar a viabilidade de conversão para via oral.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-5 md:p-6 space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Cronograma de Infusão</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajuste Técnico de Segurança</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Conflitos</span>
                    <span className={`text-base font-black ${totalChoques > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {totalChoques}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Simultâneos</span>
                    <span className={`text-base font-black ${totalSimultaneos > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {totalSimultaneos}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Atraso Médio</span>
                    <span className="text-base font-black text-slate-950">
                      {result.metrics?.avgDelay != null ? result.metrics.avgDelay.toFixed(0) : '0'}<span className="text-[10px] font-bold ml-0.5 text-slate-400">m</span>
                    </span>
                  </div>
                </div>
              </div>

              {result.warnings && result.warnings.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Conflitos e Ajustes Realizados</span>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5">
                    {result.warnings.map((w, idx) => (
                      <div key={idx} className="text-slate-700 text-[11px] font-medium bg-white/60 p-2 rounded-lg border border-slate-100" dangerouslySetInnerHTML={{ __html: w }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Day accordion cards */}
              <div className="space-y-3">
                {Array.from({ length: daysToShow }, (_, i) => i + 1).map(dayNum => (
                  <div key={dayNum} className="bg-slate-50/60 rounded-2xl border border-slate-150 overflow-hidden">
                    <button 
                      onClick={() => toggleDay(dayNum)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-xs border border-slate-200 font-bold text-xs text-blue-700">
                          {dayNum}
                        </div>
                        <div className="text-left">
                          <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Programação</span>
                          <span className="font-bold text-xs text-slate-800">Dia {dayNum} de Tratamento</span>
                        </div>
                      </div>
                      {expandedDays.includes(dayNum) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedDays.includes(dayNum) && (
                      <div className="border-t border-slate-150 bg-white">
                        {/* Tabular timeline layout (Now same for both Mobile & Desktop via overflow scrolling) */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50/40">
                                {meds.map(m => (
                                  <th key={m.id} className="py-2.5 px-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 min-w-[95px] max-w-[140px] truncate">
                                    {m.name}
                                  </th>
                                ))}
                                <th className="py-2.5 px-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 max-w-[80px]">Audit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(() => {
                                const dayDoses = result.doses.filter(d => d.day === dayNum);
                                const uniqueTimes = Array.from(new Set(dayDoses.map(d => d.startMin))).sort((a: number, b: number) => a - b) as number[];
                                
                                return uniqueTimes.map((time, idx) => {
                                  const dosesAtTime = dayDoses.filter(d => d.startMin === time);
                                  const hasCoinciding = dosesAtTime.some(d => d.isCoinciding);
                                  const hasSimultaneous = dosesAtTime.length > 1;
                                  const isConflict = hasCoinciding || hasSimultaneous;
  
                                  return (
                                    <tr key={idx} className={`hover:bg-slate-50/30 transition-colors ${isConflict ? 'bg-amber-50/15' : ''}`}>
                                      {meds.map(m => {
                                        const dose = dosesAtTime.find(d => d.medId === m.id);
                                        const isInvalid = dose && dose.delayMin > tolerance;
                                        return (
                                          <td key={m.id} className="py-3 px-3 text-center">
                                            {dose ? (
                                              <div className={`inline-flex flex-col items-center p-2 rounded-xl border ${isInvalid ? 'bg-rose-50/80 border-rose-200' : 'bg-white border-slate-150 shadow-xs'}`}>
                                                <div className="font-mono font-black text-xs text-slate-900 tracking-tight">
                                                  {formatClock(dose.startMin)}
                                                </div>
                                                <span className={`text-[8.5px] font-bold uppercase tracking-tight text-slate-500 mt-1 block`}>
                                                  {dose.modeLabel}
                                                </span>
                                                <div className="text-[8px] text-slate-400 mt-0.5 whitespace-nowrap">
                                                  Fim: {formatClock(dose.endMin)}
                                                </div>
                                                {dose.delayMin > 0 && (
                                                  <span className="text-[8px] font-extrabold text-amber-600 bg-amber-50 rounded px-1 mt-0.5">
                                                    +{dose.delayMin}m
                                                  </span>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="w-6 h-[1.5px] bg-slate-150 mx-auto" />
                                            )}
                                          </td>
                                        );
                                      })}
                                      <td className="py-3 px-3 text-center">
                                        {(() => {
                                          const isInvalidRow = dosesAtTime.some(d => d.delayMin > tolerance);
                                          if (isInvalidRow) return (
                                            <span className="bg-rose-100 border border-rose-200 text-rose-800 text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-md">
                                              Erro
                                            </span>
                                          );
                                          if (isConflict) return (
                                            <span className={`${schedulingMode === 'automatic' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-rose-50 border border-rose-200 text-rose-750'} text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-md`}>
                                              {schedulingMode === 'automatic' ? 'Ajustado' : 'Conflito'}
                                            </span>
                                          );
                                          return (
                                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-md">
                                              Ok
                                            </span>
                                          );
                                        })()}
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) ) : (
            <div className="bg-white rounded-3xl h-full shadow-xs border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-150">
                <Clock className="w-8 h-8 text-slate-300 animate-pulse" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Otimizador Clínico de Horários</h3>
              <p className="text-slate-400 mt-2 max-w-xs mx-auto text-xs leading-relaxed font-medium">
                Insira as prescrições de antimicrobianos do paciente ao lado. O sistema calculará de forma técnica e automática a escala livre de conflitos, respeitando o volume ideal e o <b className="text-blue-600">distanciamento profilático</b>.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Advisory Warning */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
            <Info className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-1 text-left">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">Aviso Regulatório e Legal</p>
            <p className="text-[10.5px] leading-relaxed text-slate-500 font-medium">
              ESTA FERRAMENTA FUNCIONA COMO UM DIRETÓRIO AUXILIAR DE ROTEAMENTO. A DECISÃO CLÍNICA FINAL DE APAZAMENTO E APLICAÇÃO PRESCREVE SOB A RESPONSABILIDADE DOS FISIOTERAPEUTAS, FARMACÊUTICOS, ENFERMEIROS OU MÉDICOS PLANTONISTAS, BASEADO NAS DIRETRIZES DE SEGURANÇA GERAIS DA ISCAL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
