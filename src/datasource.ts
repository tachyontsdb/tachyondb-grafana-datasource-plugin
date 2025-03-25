import {
  CoreApp,
  createDataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  TestDataSourceResponse,
} from "@grafana/data";
import { getBackendSrv, isFetchError } from "@grafana/runtime";
import { lastValueFrom } from "rxjs";

import { DataSourceResponse, DEFAULT_QUERY, MyDataSourceOptions, MyQuery, StreamResponse } from "./types";

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url: string;
  databaseDirectory: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.jsonData.url;
    this.databaseDirectory = instanceSettings.jsonData.databaseDirectory;
  }

  public getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  public filterQuery(query: MyQuery): boolean {
    // If no query has been provided, prevent the query from being executed
    return !!this.databaseDirectory || !!query.queryText;
  }

  public async testDatasource(): Promise<TestDataSourceResponse> {
    const defaultErrorMessage = "Cannot connect to API";

    try {
      const response = await lastValueFrom(getBackendSrv().fetch({ url: `${this.url}/health` }));
      if (response.status === 200) {
        return {
          status: "success",
          message: "Success",
        };
      } else {
        return {
          status: "error",
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      let message = "";
      if (typeof err === "string") {
        message = err;
      } else if (isFetchError(err)) {
        message = "Fetch error: " + (err.statusText ? err.statusText : defaultErrorMessage);
        if (err.data && err.data.error && err.data.error.code) {
          message += ": " + err.data.error.code + ". " + err.data.error.message;
        }
      } else {
        message += defaultErrorMessage;
      }
      return {
        status: "error",
        message,
      };
    }
  }

  public async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const start = options.range.from.valueOf();
    const end = options.range.to.valueOf();

    const results = options.targets.map(async (target) => {
      const result = await getBackendSrv().post<DataSourceResponse>(`${this.url}/query`, {
        path: this.databaseDirectory,
        query: target.queryText,
        start,
        end,
      });

      return createDataFrame({
        refId: target.refId,
        fields: [
          { name: "Timestamp", values: result.timestamps, type: FieldType.time },
          {
            name: target.queryText,
            values:
              (result.value_type === "UInteger64"
                ? result.values_u64
                : result.value_type === "Integer64"
                  ? result.values_i64
                  : result.values_f64)
              ?? [],
            type: FieldType.number,
          },
        ],
      });
    });

    return { data: await Promise.all(results) };
  }

  /**
   * Fetches available streams and their matchers from the backend
   */
  public async getStreams(): Promise<StreamResponse> {
    if (!this.url || !this.databaseDirectory) {
      return { streams: [] };
    }

    try {
      const response = await getBackendSrv().post<StreamResponse>(`${this.url}/get_streams`, {
        path: this.databaseDirectory,
      });
      return response;
    } catch (error) {
      console.error("Error fetching streams:", error);
      return { streams: [] };
    }
  }
}
