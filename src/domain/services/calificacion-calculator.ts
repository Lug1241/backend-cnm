import {
  CalificacionFinal,
  CalificacionParcial,
  CalificacionParcialBe,
  CalificacionQuimestral,
  CalificacionQuimestralBe,
  EstadoCalificacionFinal,
  ParcialCalificacion,
  QuimestreCalificacion,
} from '../entities/calificacion.entity';

export interface ResultadoParcialSuperior {
  ponderacion70: number;
  ponderacion30: number;
  promedioParcial: number;
  comportamiento: number;
  valoracionComportamiento: string;
}

export interface ResultadoQuimestreSuperior {
  parcial1: number;
  parcial2: number;
  promedioParciales: number;
  ponderacion70: number;
  examen: number;
  ponderacion30: number;
  promedioQuimestral: number;
  comportamiento: number;
  valoracionComportamiento: string;
}

export interface ResultadoFinalSuperior {
  primerQuimestre: number;
  segundoQuimestre: number;
  promedioAnual: number;
  comportamiento: number;
  valoracionComportamiento: string;
  examenRecuperacion: number | null;
  promedioFinal: number;
  estado: EstadoCalificacionFinal;
}

export interface ResultadoParcialBe {
  promedioInsumos: number;
  ponderacion70: number;
  promedioMejora: number | null;
  promedioSumativas: number;
  ponderacion30: number;
  notaParcial: number;
}

export interface ResultadoQuimestreBe {
  parcial1: number;
  parcial2: number;
  promedioParciales: number;
  ponderacion70: number;
  examen: number;
  ponderacion30: number;
  promedioQuimestral: number;
}

export interface ResultadoFinalBe {
  primerQuimestre: number;
  segundoQuimestre: number;
  promedioFinal: number;
  estado: 'Aprobado' | 'Reprobado';
}

export function calcularParcialSuperior(
  parcial: CalificacionParcial,
): ResultadoParcialSuperior {
  const promedioInsumos = (parcial.insumo1 + parcial.insumo2) / 2;
  const ponderacion70 = promedioInsumos * 0.7;
  const ponderacion30 = parcial.evaluacion * 0.3;
  const comportamiento = sumarComportamiento(parcial.comportamiento);

  return {
    ponderacion70,
    ponderacion30,
    promedioParcial: ponderacion70 + ponderacion30,
    comportamiento,
    valoracionComportamiento: valorarComportamiento(comportamiento),
  };
}

export function calcularQuimestreSuperior(
  parciales: CalificacionParcial[],
  quimestral: CalificacionQuimestral | undefined,
  quimestre: QuimestreCalificacion,
): ResultadoQuimestreSuperior | null {
  const p1 = parciales.find(
    (row) =>
      row.quimestre === quimestre && row.parcial === ParcialCalificacion.P1,
  );
  const p2 = parciales.find(
    (row) =>
      row.quimestre === quimestre && row.parcial === ParcialCalificacion.P2,
  );

  if (!p1 || !p2 || !quimestral || quimestral.quimestre !== quimestre) {
    return null;
  }

  const resultadoP1 = calcularParcialSuperior(p1);
  const resultadoP2 = calcularParcialSuperior(p2);
  const promedioParciales =
    (resultadoP1.promedioParcial + resultadoP2.promedioParcial) / 2;
  const ponderacion70 = promedioParciales * 0.7;
  const ponderacion30 = quimestral.examen * 0.3;
  const comportamiento =
    (resultadoP1.comportamiento + resultadoP2.comportamiento) / 2;

  return {
    parcial1: resultadoP1.promedioParcial,
    parcial2: resultadoP2.promedioParcial,
    promedioParciales,
    ponderacion70,
    examen: quimestral.examen,
    ponderacion30,
    promedioQuimestral: ponderacion70 + ponderacion30,
    comportamiento,
    valoracionComportamiento: valorarComportamiento(comportamiento),
  };
}

export function calcularFinalSuperior(
  q1: ResultadoQuimestreSuperior | null,
  q2: ResultadoQuimestreSuperior | null,
  final: CalificacionFinal | undefined,
): ResultadoFinalSuperior | null {
  if (!q1 || !q2) return null;

  const promedioAnual = (q1.promedioQuimestral + q2.promedioQuimestral) / 2;
  const comportamiento = (q1.comportamiento + q2.comportamiento) / 2;
  const examenRecuperacion = final?.examenRecuperacion ?? null;
  const rindioRecuperacion = examenRecuperacion !== null;
  const promedioFinal =
    promedioAnual < 7 && rindioRecuperacion
      ? examenRecuperacion
      : promedioAnual;

  return {
    primerQuimestre: q1.promedioQuimestral,
    segundoQuimestre: q2.promedioQuimestral,
    promedioAnual,
    comportamiento,
    valoracionComportamiento: valorarComportamiento(comportamiento),
    examenRecuperacion,
    promedioFinal,
    estado: determinarEstadoFinal(promedioFinal, rindioRecuperacion),
  };
}

export function calcularParcialBe(
  parcial: CalificacionParcialBe,
): ResultadoParcialBe {
  const promedioInsumos = (parcial.insumo1 + parcial.insumo2) / 2;
  const ponderacion70 = promedioInsumos * 0.7;

  let promedioMejora: number | null = null;
  let promedioSumativas = parcial.evaluacion;

  if (parcial.mejoramiento !== null) {
    promedioMejora = (parcial.evaluacion + parcial.mejoramiento) / 2;

    if (parcial.mejoramiento >= parcial.evaluacion) {
      promedioSumativas = (promedioMejora + parcial.evaluacion) / 2;
    }
  }

  const ponderacion30 = promedioSumativas * 0.3;

  return {
    promedioInsumos,
    ponderacion70,
    promedioMejora,
    promedioSumativas,
    ponderacion30,
    notaParcial: ponderacion70 + ponderacion30,
  };
}

export function calcularQuimestreBe(
  parciales: CalificacionParcialBe[],
  quimestral: CalificacionQuimestralBe | undefined,
  quimestre: QuimestreCalificacion,
): ResultadoQuimestreBe | null {
  const p1 = parciales.find(
    (row) =>
      row.quimestre === quimestre && row.parcial === ParcialCalificacion.P1,
  );
  const p2 = parciales.find(
    (row) =>
      row.quimestre === quimestre && row.parcial === ParcialCalificacion.P2,
  );

  if (!p1 || !p2 || !quimestral || quimestral.quimestre !== quimestre) {
    return null;
  }

  const resultadoP1 = calcularParcialBe(p1);
  const resultadoP2 = calcularParcialBe(p2);
  const promedioParciales =
    (resultadoP1.notaParcial + resultadoP2.notaParcial) / 2;
  const ponderacion70 = promedioParciales * 0.7;
  const ponderacion30 = quimestral.examen * 0.3;

  return {
    parcial1: resultadoP1.notaParcial,
    parcial2: resultadoP2.notaParcial,
    promedioParciales,
    ponderacion70,
    examen: quimestral.examen,
    ponderacion30,
    promedioQuimestral: ponderacion70 + ponderacion30,
  };
}

export function calcularFinalBe(
  q1: ResultadoQuimestreBe | null,
  q2: ResultadoQuimestreBe | null,
): ResultadoFinalBe | null {
  if (!q1 || !q2) return null;

  const promedioFinal = (q1.promedioQuimestral + q2.promedioQuimestral) / 2;

  return {
    primerQuimestre: q1.promedioQuimestral,
    segundoQuimestre: q2.promedioQuimestral,
    promedioFinal,
    estado: promedioFinal >= 7 ? 'Aprobado' : 'Reprobado',
  };
}

export function valorarComportamiento(valor: number): string {
  const truncado = Math.floor(valor);

  if (truncado === 10) return 'A';
  if (truncado === 9) return 'B';
  if (truncado >= 7) return 'C';
  if (truncado >= 5) return 'D';
  return 'E';
}

function sumarComportamiento(comportamiento: number[]): number {
  return comportamiento.reduce((total, valor) => total + (Number(valor) || 0), 0);
}

function determinarEstadoFinal(
  promedioFinal: number,
  rindioRecuperacion: boolean,
): EstadoCalificacionFinal {
  if (promedioFinal >= 7) return 'Aprobado';
  if (!rindioRecuperacion && promedioFinal >= 4) return 'Supletorio';
  return 'Reprobado';
}
