import type { TablesObject } from '../types.js';
export declare function pluralToSingular(plural: string): string;
export declare function buildSeparateSQLQueries({ tables }: TablesObject): string[];
