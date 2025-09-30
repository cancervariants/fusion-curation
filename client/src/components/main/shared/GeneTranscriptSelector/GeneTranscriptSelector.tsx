import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

export interface Transcript {
  transcript: string;
  maneStatus: string | null;
}

interface Props {
  transcript: string;
  onTranscriptChange: (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
    child: React.ReactNode
  ) => void;
  transcripts: Transcript[];
}

const GeneTranscriptSelector: React.FC<Props> = ({
  transcript,
  onTranscriptChange,
  transcripts,
}) => {
  return (
    <FormControl variant="standard">
      <InputLabel id="transcript-select-label">Transcript</InputLabel>
      <Select
        labelId="transcript-select-label"
        id="transcript-select"
        value={transcript}
        label="Transcript"
        onChange={onTranscriptChange}
        placeholder="Transcript"
        style={{ minWidth: "150px" }}
      >
        {transcripts.map((tx, index) => (
          <MenuItem key={index} value={tx.transcript}>
            {tx.transcript} {tx.maneStatus ? `(${tx.maneStatus})` : null}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default GeneTranscriptSelector;
