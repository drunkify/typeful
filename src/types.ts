import type { performQuery } from './core/utils.js'

export type ModelType = { [k: string]: number | string | boolean | ModelType[] | undefined }
export type NumberFilter = { eq?: number }
export type StringFilter = { like?: string; eq?: string }
export type BooleanFilter = { eq?: boolean }

export type WhereCondition<T extends ModelType[]> =
  | {
      [F in keyof T[number]]?: T[number][F] extends string | undefined
        ? StringFilter
        : T[number][F] extends number | undefined
          ? NumberFilter
          : T[number][F] extends boolean | undefined
            ? BooleanFilter
            : never
    }
  | {
      $and?: WhereCondition<T>[]
    }
  | {
      $or?: WhereCondition<T>[]
    }

export interface Query<T extends ModelType[]> {
  where?: WhereCondition<T>
  select?: {
    [F in keyof T[number]]: T[number][F] extends string | number | boolean | undefined ? F : never
  }[keyof T[number]][]
  join?: {
    [F in keyof T[number] as T[number][F] extends ModelType[] ? F : never]?: T[number][F] extends ModelType[] ? Query<Required<T[number][F]>> : never
  }
  orderBy?: {
    [F in keyof T[number]]?: T[number][F] extends string | number | boolean | undefined ? 'asc' | 'desc' : never
  }
  limit?: number
  offset?: number
}

export type WhereClause =
  | {
      [key: string]: NumberFilter | StringFilter | BooleanFilter
    }
  | {
      $and?: WhereClause[]
    }
  | {
      $or?: WhereClause[]
    }

export interface QueryObject {
  select?: string[]
  join?: {
    [key: string]: QueryObject
  }
  where?: WhereClause
  orderBy?: {
    [key: string]: 'asc' | 'desc'
  }
  limit?: number
  offset?: number
}

export interface TablesObject {
  tables: {
    [key: string]: QueryObject
  }
}

export type Row = Record<string, string | number | null>

type PluralToSingular<T extends string> = T extends `${infer S}s` ? S : T

type ForeignKeyFor<T extends string> = `${PluralToSingular<T>}_id`

export type QueryToModel<M extends ModelType, T extends QueryObject> = {
  [K in NonNullable<T['select']>[number]]: M[K]
} & {
  [K in keyof T['join']]: T['join'][K] extends QueryObject
    ? K extends keyof M
      ? M[K] extends ModelType[]
        ? Array<QueryToModel<M[K][number], T['join'][K]>> & {
            // eslint-disable-next-line no-unused-vars
            get: <X extends keyof QueryToModel<M[K][number], T['join'][K]>>(key: X) => { [C: string | number]: QueryToModel<M[K][number], T['join'][K]> }
          }
        : never
      : never
    : never
} & {
  [K in keyof T['join'] as ForeignKeyFor<K & string> extends NonNullable<T['select']>[number] ? PluralToSingular<K & string> : never]?: T['join'][K] extends QueryObject
    ? K extends keyof M
      ? M[K] extends ModelType[]
        ? QueryToModel<M[K][number], T['join'][K]>
        : never
      : never
    : never
}

export type DataType<Tables extends Record<string, ModelType[]>, Q extends Partial<Record<keyof Tables, QueryObject>>> = {
  [T in keyof Q & keyof Tables]: Q[T] extends QueryObject ? QueryToModel<Tables[T][number], Q[T]>[] : never
}

export type QueryInstance<Tables extends { [key: string]: ModelType[] }> = {
  tables: {
    [F in keyof Tables]?: Query<Tables[F]>
  }
}

// eslint-disable-next-line
export type DTO<T extends Record<string, ModelType[]>, F extends (...args: any) => any> = Awaited<ReturnType<typeof performQuery<T, ReturnType<F>>>>
