/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Medicamento {
  id: string;
  nome: string;
  forma: string;
  categoria: string;
  vias: string[];
  dose: string;
  reconstituicao: string;
  diluicao: string;
  tempo: string;
  estabilidade: string;
  sonda: 'Sim' | 'Não' | 'Restrito';
  observacoes?: string;
  customizado?: boolean;
  tempoPadraoMinutos?: number;
  volumePadraoMl?: number;
}

export interface SondaMedicamento {
  id: string;
  ativo: string;
  forma: string;
  comercial: string;
  preparoComprimido: string;
  preparoLiquido: string;
  recomendacoes: string;
  sonda: 'Sim' | 'Não' | 'Restrito';
}

export type CategoriaFilter = 'Todos' | 'Antibióticos' | 'Analgésicos e Sedativos' | 'Cardiovasculares' | 'Antídotos e Antieméticos' | 'Outros';

export interface CalculadoraState {
  volume: number;
  tempoHoras: number;
  tempoMinutos: number;
  usarMinutos: boolean;
}
