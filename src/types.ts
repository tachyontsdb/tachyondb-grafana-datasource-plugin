import { DataSourceJsonData } from "@grafana/data";
import { DataQuery } from "@grafana/schema";

export interface MyQuery extends DataQuery {
  queryText: string;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {};

export interface DataSourceResponse {
  value_type: "UInteger64" | "Integer64" | "Float64";
  timestamps: number[];
  values_u64?: number[] | null;
  values_i64?: number[] | null;
  values_f64?: number[] | null;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url: string;
  databaseDirectory: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
