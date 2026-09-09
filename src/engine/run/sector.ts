/* Sector helpers — the 30-floor unit of a Story run (§11). */

import type { SectorDefinition } from '../types';
import { RUN } from '../../data/balance';
import { SECTORS, sectorForFloor } from '../../data/sectors';

export { sectorForFloor };

export function sectorProgress(floor: number): { sector: SectorDefinition; index: number; of: number } {
  const sector = sectorForFloor(floor);
  const start = sector.index * RUN.SECTOR_SIZE;
  return { sector, index: floor - start, of: RUN.SECTOR_SIZE };
}

export function isSectorBoundary(floor: number): boolean {
  return floor % RUN.SECTOR_SIZE === 0;
}

export function nextSector(floor: number): SectorDefinition | null {
  const current = sectorForFloor(floor);
  return SECTORS[current.index + 1] ?? null;
}

/** Endless mode keeps cycling the sector list once Story's ten are spent. */
export function endlessSector(floor: number): SectorDefinition {
  return SECTORS[Math.floor((floor - 1) / RUN.SECTOR_SIZE) % SECTORS.length];
}
