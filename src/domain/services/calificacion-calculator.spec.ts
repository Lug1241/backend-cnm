import {
  calcularFinalBe,
  calcularFinalSuperior,
  calcularParcialBe,
  calcularParcialSuperior,
  calcularQuimestreBe,
  calcularQuimestreSuperior,
} from './calificacion-calculator';
import {
  CalificacionParcial,
  CalificacionParcialBe,
  ParcialCalificacion,
  QuimestreCalificacion,
} from '../entities/calificacion.entity';

const comportamientoCompleto = Array(10).fill(1);

function parcialSuperior(
  parcial: ParcialCalificacion,
  quimestre: QuimestreCalificacion,
  valores = { insumo1: 8, insumo2: 10, evaluacion: 9 },
): CalificacionParcial {
  return {
    id: 1,
    inscripcionId: 100,
    ...valores,
    comportamiento: comportamientoCompleto,
    parcial,
    quimestre,
  };
}

function parcialBe(
  parcial: ParcialCalificacion,
  quimestre: QuimestreCalificacion,
  mejoramiento: number | null,
): CalificacionParcialBe {
  return {
    id: 1,
    inscripcionId: 100,
    insumo1: 8,
    insumo2: 10,
    evaluacion: 8,
    mejoramiento,
    parcial,
    quimestre,
  };
}

describe('calificacion-calculator', () => {
  it('calcula el parcial superior con ponderación 70/30', () => {
    const resultado = calcularParcialSuperior(
      parcialSuperior(ParcialCalificacion.P1, QuimestreCalificacion.Q1),
    );

    expect(resultado.promedioParcial).toBeCloseTo(9, 10);
    expect(resultado.comportamiento).toBe(10);
    expect(resultado.valoracionComportamiento).toBe('A');
  });

  it('calcula un quimestre superior con dos parciales y examen', () => {
    const parciales = [
      parcialSuperior(ParcialCalificacion.P1, QuimestreCalificacion.Q1),
      parcialSuperior(
        ParcialCalificacion.P2,
        QuimestreCalificacion.Q1,
        { insumo1: 10, insumo2: 10, evaluacion: 10 },
      ),
    ];

    const resultado = calcularQuimestreSuperior(
      parciales,
      {
        id: 1,
        inscripcionId: 100,
        examen: 8,
        quimestre: QuimestreCalificacion.Q1,
      },
      QuimestreCalificacion.Q1,
    );

    expect(resultado).not.toBeNull();
    expect(resultado!.parcial1).toBeCloseTo(9, 10);
    expect(resultado!.parcial2).toBeCloseTo(10, 10);
    expect(resultado!.promedioQuimestral).toBeCloseTo(9.05, 10);
  });

  it('mantiene estado Supletorio si el promedio anual está entre 4 y 7 y no rindió recuperación', () => {
    const q1 = {
      parcial1: 6.5,
      parcial2: 6.5,
      promedioParciales: 6.5,
      ponderacion70: 4.55,
      examen: 6.5,
      ponderacion30: 1.95,
      promedioQuimestral: 6.5,
      comportamiento: 10,
      valoracionComportamiento: 'A',
    };

    const resultado = calcularFinalSuperior(q1, q1, undefined);

    expect(resultado?.promedioFinal).toBe(6.5);
    expect(resultado?.estado).toBe('Supletorio');
  });

  it('usa la nota de recuperación como promedio final cuando se rindió supletorio', () => {
    const q1 = {
      parcial1: 6.5,
      parcial2: 6.5,
      promedioParciales: 6.5,
      ponderacion70: 4.55,
      examen: 6.5,
      ponderacion30: 1.95,
      promedioQuimestral: 6.5,
      comportamiento: 10,
      valoracionComportamiento: 'A',
    };

    const resultado = calcularFinalSuperior(q1, q1, {
      id: 1,
      inscripcionId: 100,
      examenRecuperacion: 5.5,
    });

    expect(resultado?.promedioAnual).toBe(6.5);
    expect(resultado?.promedioFinal).toBe(5.5);
    expect(resultado?.estado).toBe('Reprobado');
  });

  it('aplica mejoramiento de BE solo cuando no empeora la evaluación', () => {
    const conMejora = calcularParcialBe(
      parcialBe(ParcialCalificacion.P1, QuimestreCalificacion.Q1, 10),
    );
    const conNotaMenor = calcularParcialBe(
      parcialBe(ParcialCalificacion.P1, QuimestreCalificacion.Q1, 7),
    );

    expect(conMejora.promedioMejora).toBe(9);
    expect(conMejora.promedioSumativas).toBe(8.5);
    expect(conMejora.notaParcial).toBeCloseTo(8.85, 10);
    expect(conNotaMenor.promedioSumativas).toBe(8);
    expect(conNotaMenor.notaParcial).toBeCloseTo(8.7, 10);
  });

  it('calcula quimestre y final de Básico Elemental', () => {
    const parcialesQ1 = [
      parcialBe(ParcialCalificacion.P1, QuimestreCalificacion.Q1, null),
      parcialBe(ParcialCalificacion.P2, QuimestreCalificacion.Q1, null),
    ];
    const parcialesQ2 = [
      parcialBe(ParcialCalificacion.P1, QuimestreCalificacion.Q2, null),
      parcialBe(ParcialCalificacion.P2, QuimestreCalificacion.Q2, null),
    ];

    const q1 = calcularQuimestreBe(
      parcialesQ1,
      {
        id: 1,
        inscripcionId: 100,
        examen: 9,
        quimestre: QuimestreCalificacion.Q1,
      },
      QuimestreCalificacion.Q1,
    );
    const q2 = calcularQuimestreBe(
      parcialesQ2,
      {
        id: 2,
        inscripcionId: 100,
        examen: 9,
        quimestre: QuimestreCalificacion.Q2,
      },
      QuimestreCalificacion.Q2,
    );
    const final = calcularFinalBe(q1, q2);

    expect(q1?.promedioQuimestral).toBeCloseTo(8.79, 10);
    expect(final?.promedioFinal).toBeCloseTo(8.79, 10);
    expect(final?.estado).toBe('Aprobado');
  });
});
