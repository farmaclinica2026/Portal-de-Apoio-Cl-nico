export interface DoseMode {
  label: string;
  durationMin: number;
}

export interface Antimicrobial {
  modes: DoseMode[];
}

export const ANTIMICROBIALS_DATA: Record<string, Antimicrobial> = {
  "AMICACINA": { modes: [{ label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "AMOXICILINA + CLAVULANATO": { modes: [{ label: "EV direto 4 min", durationMin: 4 }, { label: "Infusão 30 min", durationMin: 30 }] },
  "AMPICILINA + SULBACTAM": { modes: [{ label: "Infusão 15 min", durationMin: 15 }, { label: "Infusão 30 min", durationMin: 30 }] },
  "AZITROMICINA": { modes: [{ label: "Infusão 1h", durationMin: 60 }, { label: "Infusão 3h", durationMin: 180 }] },
  "AZTREONAM": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "Diluído 20 min", durationMin: 20 }, { label: "Diluído 60 min", durationMin: 60 }] },
  "CEFAZOLINA": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "Diluído 30 min", durationMin: 30 }, { label: "Diluído 60 min", durationMin: 60 }] },
  "CEFEPIMA": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "Infusão 30 min", durationMin: 30 }] },
  "CEFTAROLINA FOSAMILA": { modes: [{ label: "Infusão 5 min", durationMin: 5 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "CEFTAZIDIMA": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "Infusão 15 min", durationMin: 15 }, { label: "Infusão 30 min", durationMin: 30 }] },
  "CEFTAZIDIMA + AVIBACTAM": { modes: [{ label: "Infusão 2h", durationMin: 120 }] },
  "CEFTOLOZANA + TAZOBACTAM": { modes: [{ label: "Infusão 60 min", durationMin: 60 }] },
  "CEFTRIAXONA": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "CEFUROXIMA": { modes: [{ label: "EV direto 5 min", durationMin: 5 }] },
  "CIPROFLOXACINO": { modes: [{ label: "Infusão 1h", durationMin: 60 }] },
  "CLINDAMICINA": { modes: [{ label: "Infusão 10 min", durationMin: 10 }, { label: "Infusão 40 min", durationMin: 40 }] },
  "DAPTOMICINA": { modes: [{ label: "EV direto 2 min", durationMin: 2 }, { label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "DELAFLOXACINO MEGLUMINA": { modes: [{ label: "Infusão 1h", durationMin: 60 }] },
  "ERTAPENEM": { modes: [{ label: "Infusão 30 min", durationMin: 30 }] },
  "GENTAMICINA": { modes: [{ label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "IMIPENEM + CILASTATINA SÓDICA": { modes: [{ label: "Infusão 3h", durationMin: 180 }] },
  "LEVOFLOXACINO": { modes: [{ label: "500 mg em 60 min", durationMin: 60 }, { label: "750 mg em 90 min", durationMin: 90 }] },
  "LINEZOLIDA": { modes: [{ label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 2h", durationMin: 120 }] },
  "MEROPENEM": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "SG 5% até 30 min", durationMin: 30 }, { label: "SF 0,9% 3h", durationMin: 180 }] },
  "METRONIDAZOL": { modes: [{ label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "MOXIFLOXACINA": { modes: [{ label: "Bolus 3 min", durationMin: 3 }, { label: "Infusão 15 min", durationMin: 15 }] },
  "OXACILINA": { modes: [{ label: "Direto 10 min", durationMin: 10 }, { label: "Infusão 1h", durationMin: 60 }] },
  "PIPERACILINA + TAZOBACTAM": { modes: [{ label: "Infusão rápida 30 min", durationMin: 30 }, { label: "Infusão lenta 3h", durationMin: 180 }, { label: "Infusão lenta 4h", durationMin: 240 }] },
  "POLIMIXINA B": { modes: [{ label: "Infusão 1h", durationMin: 60 }, { label: "Infusão 2h", durationMin: 120 }] },
  "SULFAMETOXAZOL + TRIMETOPRIMA": { modes: [{ label: "Infusão 60 min", durationMin: 60 }, { label: "Infusão 90 min", durationMin: 90 }] },
  "TEICOPLANINA": { modes: [{ label: "EV direto 5 min", durationMin: 5 }, { label: "Infusão 30 min", durationMin: 30 }] },
  "TIGECICLINA": { modes: [{ label: "Infusão 30 min", durationMin: 30 }, { label: "Infusão 60 min", durationMin: 60 }] },
  "VANCOMICINA": { modes: [{ label: "Infusão 60 min", durationMin: 60 }, { label: "Infusão 120 min", durationMin: 120 }] },
  "ANFOTERICINA B": { modes: [{ label: "Infusão 2h", durationMin: 120 }, { label: "Infusão 6h", durationMin: 360 }] },
  "ANFOTERICINA B COMPLEXO LIPÍDICO": { modes: [{ label: "Infusão 2h", durationMin: 120 }, { label: "Infusão 3h", durationMin: 180 }] },
  "ANIDULAFUNGINA": { modes: [{ label: "Infusão 90 min", durationMin: 90 }, { label: "Infusão 180 min", durationMin: 180 }] },
  "FLUCONAZOL": { modes: [{ label: "Infusão 60 min", durationMin: 60 }, { label: "Infusão 120 min", durationMin: 120 }] },
  "MICAFUNGINA": { modes: [{ label: "Infusão 1h", durationMin: 60 }] },
  "VORICONAZOL": { modes: [{ label: "Infusão 2h", durationMin: 120 }] },
  "ACICLOVIR SÓDICO": { modes: [{ label: "Infusão 1h", durationMin: 60 }] },
  "GANCICLOVIR": { modes: [{ label: "Infusão 1h", durationMin: 60 }] }
};

export const ANTIMICROBIALS = Object.keys(ANTIMICROBIALS_DATA).sort().map(name => ({
  name,
  modes: ANTIMICROBIALS_DATA[name].modes
}));

export const FREQUENCIES = [
  { label: "4/4h", value: 4 },
  { label: "6/6h", value: 6 },
  { label: "8/8h", value: 8 },
  { label: "12/12h", value: 12 },
  { label: "24/24h", value: 24 },
];
