import { DataSourcePluginOptionsEditorProps } from "@grafana/data";
import { InlineField, Input, SecretInput } from "@grafana/ui";
import React, { ChangeEvent } from "react";
import { MyDataSourceOptions, MySecureJsonData } from "../types";

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields, secureJsonData } = options;

  const onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        url: event.target.value,
      },
    });
  };

  const onDatabaseDirectoryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        databaseDirectory: event.target.value,
      },
    });
  };

  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };

  const onResetAPIKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: "",
      },
    });
  };

  return (
    <>
      <InlineField label="URL" labelWidth={14} interactive tooltip={"Json field returned to frontend"}>
        <Input
          id="config-editor-url"
          onChange={onURLChange}
          value={jsonData.url}
          placeholder="Enter the URL"
          width={40}
        />
      </InlineField>
      <InlineField label="Database Directory" labelWidth={14} interactive tooltip={"Json field returned to frontend"}>
        <Input
          id="config-editor-database-directory"
          onChange={onDatabaseDirectoryChange}
          value={jsonData.databaseDirectory}
          placeholder="Enter the Database Directory"
          width={40}
        />
      </InlineField>
      <InlineField label="API Key" labelWidth={14} interactive tooltip={"Secure json field (backend only)"}>
        <SecretInput
          required
          id="config-editor-api-key"
          isConfigured={secureJsonFields.apiKey}
          value={secureJsonData?.apiKey}
          placeholder="Enter your API Key"
          width={40}
          onReset={onResetAPIKey}
          onChange={onAPIKeyChange}
        />
      </InlineField>
    </>
  );
}
