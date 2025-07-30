// utils/calculateTotal.ts

export interface PeriodData {
  oms: number;
  kostpr: number;
  moms: number;
  eksp: number;
}

export interface TotalSummary {
  oms: number;
  omsIdx: number; // +/- ændring
  db: number;
  dg: number;
  eksp: number;
  ekspIdx: number; // +/- ændring
  gnsKob: number;
  gnsKobIdx: number; // +/- ændring
}

export function calculateTotal(p1: PeriodData, p2: PeriodData): TotalSummary {
  const oms = p1.oms;
  const omsIdx = p2.oms !== 0 ? ((p1.oms / p2.oms) * 100 - 100) : 0;

  const db = p1.oms - p1.moms - p1.kostpr;
  const nettoOms = p1.oms - p1.moms;
  const dg = nettoOms !== 0 ? (db / nettoOms) * 100 : 0;

  const eksp = p1.eksp;
  const ekspIdx = p2.eksp !== 0 ? ((p1.eksp / p2.eksp) * 100 - 100) : 0;

  const gnsKob = p1.eksp !== 0 ? p1.oms / p1.eksp : 0;
  const gnsKob2 = p2.eksp !== 0 ? p2.oms / p2.eksp : 0;
  const gnsKobIdx = gnsKob2 !== 0 ? ((gnsKob / gnsKob2) * 100 - 100) : 0;

  return {
    oms,
    omsIdx,
    db,
    dg,
    eksp,
    ekspIdx,
    gnsKob,
    gnsKobIdx,
  };
}
