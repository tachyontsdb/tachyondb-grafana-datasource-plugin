import { QueryEditorProps, SelectableValue } from "@grafana/data";
import { AsyncSelect, InlineField, Stack } from "@grafana/ui";
import React, { useEffect, useState } from "react";
import { DataSource } from "../datasource";
import { MyDataSourceOptions, MyQuery, Stream } from "../types";

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const streamToString = (stream: Stream) => {
  const matchersString = stream.matchers
    .map(matcher => `${matcher.label}="${matcher.value}"`)
    .join(",");
  
  return stream.matchers.length > 0 ? `${stream.name}{${matchersString}}` : stream.name;
};

export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Array<SelectableValue<string>>>([]);

  const { queryText } = query;

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      try {
        const response = await datasource.getStreams();

        const streamOptions = response.streams.map(stream => {
          let streamString = streamToString(stream);
          return {
            label: streamString,
            value: streamString,
          };
        });
        setOptions(streamOptions);
      } catch (error) {
        console.error("Error fetching streams:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchStreams();
  }, [datasource]);

  const onQueryTextChange = (value: string) => {
    onChange({ ...query, queryText: value });
    if (onRunQuery) {
      onRunQuery();
    }
  };

  // Handle selecting from dropdown
  const handleSelectionChange = (value: SelectableValue<string>) => {
    // Check if a value was selected
    if (value && value.value !== undefined) {
      onQueryTextChange(value.value);
    } else {
      onQueryTextChange("");
    }
  };

  return (
    <Stack gap={0}>
      <InlineField label="Query Text" labelWidth={16} tooltip="Select a stream">
        <AsyncSelect
          id="query-editor-query-text"
          width={30}
          isLoading={loading}
          defaultOptions={options}
          allowCustomValue
          value={options.find((option) => option.value === queryText)}
          onChange={handleSelectionChange}
          placeholder="Select stream"
          noOptionsMessage="No matching streams found"
          loadOptions={(query) => {
            const filtered = options.filter((option) => option.label?.toLowerCase().includes(query.toLowerCase()));
            return Promise.resolve(filtered);
          }}
          isClearable
        />
      </InlineField>
    </Stack>
  );
}
