export enum NivelMateria {
  _1RO_BE = '1ro BE',
  _2DO_BE = '2do BE',
  _1RO_BM = '1ro BM',
  _2DO_BM = '2do BM',
  _3RO_BM = '3ro BM',
  _1RO_BS = '1ro BS',
  _2DO_BS = '2do BS',
  _3RO_BS = '3ro BS',
  _1RO_BCH = '1ro BCH',
  _2DO_BCH = '2do BCH',
  _3RO_BCH = '3ro BCH',
  BCH = 'BCH',
  BM = 'BM',
  BS = 'BS',
  BS_BCH = 'BS BCH',
  BE = 'BE',
  BM_BS = 'BM BS',
  BM_BS_BCH = 'BM BS BCH',
}

export enum TipoMateria {
  GRUPAL = 'Grupal',
  INDIVIDUAL = 'Individual',
}

export class Materia {
  id?: number;
  nombre!: string;
  nivel!: NivelMateria;
  tipo!: TipoMateria;
  observaciones!: string;
  edadMin!: number;

  constructor(partial: Partial<Materia>) {
    Object.assign(this, partial);
  }
}
