import type { DataType, ModelType, QueryObject, TablesObject } from '../types.js';
export declare function performQuery<Tables extends Record<string, ModelType[]>, T extends {
    tables: Partial<Record<keyof Tables, QueryObject>>;
}>(query: T): Promise<DataType<Tables, T['tables']>>;
export declare function fetchData(query: TablesObject): Promise<Array<Array<Record<string, unknown>>>>;
export declare function collectData<Tables extends Record<string, ModelType[]>, T extends {
    tables: Partial<Record<keyof Tables, QueryObject>>;
}>(response: Awaited<ReturnType<typeof fetchData>>, query: T): DataType<Tables, T['tables']>;
