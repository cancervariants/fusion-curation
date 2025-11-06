import React from "react";
import { TextField, Typography, Box } from "@mui/material";
import HelpTooltip from "../HelpTooltip/HelpTooltip";

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface TxGenomicCoordsProps {
  component: string;
  genomicStart: string;
  genomicEnd: string;
  txStartingGenomicText?: string;
  txEndingGenomicText?: string;
  setTxStartingGenomicText: Setter<string>;
  setTxEndingGenomicText: Setter<string>;
  setGenomicStart: Setter<string>;
  setGenomicEnd: Setter<string>;
  setNumericField: (
    val: string,
    warnSetter: Setter<string>,
    valueSetter: Setter<string>,
    positive: boolean
  ) => void;
  handleEnterKey?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TxGenomicCoords: React.FC<TxGenomicCoordsProps> = ({
  component,
  genomicStart,
  genomicEnd,
  txStartingGenomicText,
  txEndingGenomicText,
  setTxStartingGenomicText,
  setTxEndingGenomicText,
  setGenomicStart,
  setGenomicEnd,
  setNumericField,
  handleEnterKey,
}) => {
  return (
    <Box display="flex" gap="1rem" alignItems="flex-end" className="mid-inputs">
      <HelpTooltip
        placement="bottom"
        title={
          <Typography>{`The starting genomic position (residue) of the ${component}.`}</Typography>
        }
      >
        <TextField
          margin="dense"
          InputLabelProps={{ shrink: true }}
          label="Genomic Starting Position (Residue)"
          style={{ width: 300 }}
          value={genomicStart ?? ""}
          onChange={(e) =>
            setNumericField(
              e.target.value,
              setTxStartingGenomicText,
              setGenomicStart,
              true
            )
          }
          onKeyDown={handleEnterKey}
          error={!!txStartingGenomicText}
          helperText={txStartingGenomicText || ""}
        />
      </HelpTooltip>

      <HelpTooltip
        placement="bottom"
        title={
          <Typography>{`The ending genomic position (residue) of the ${component}.`}</Typography>
        }
      >
        <TextField
          margin="dense"
          InputLabelProps={{ shrink: true }}
          label="Genomic Ending Position (Residue)"
          style={{ width: 300 }}
          value={genomicEnd ?? ""}
          onChange={(e) =>
            setNumericField(
              e.target.value,
              setTxEndingGenomicText,
              setGenomicEnd,
              true
            )
          }
          onKeyDown={handleEnterKey}
          error={!!txEndingGenomicText}
          helperText={txEndingGenomicText || ""}
        />
      </HelpTooltip>
    </Box>
  );
};
