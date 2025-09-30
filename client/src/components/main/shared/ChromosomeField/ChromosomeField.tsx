import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import React, { ChangeEvent, ReactNode } from "react";
import HelpTooltip from "../HelpTooltip/HelpTooltip";

const REFSEQ_CHROMOSOME_IDENTIFIERS = [
  { identifier: "NC_000001.11", shorthand: "chr1" },
  { identifier: "NC_000002.12", shorthand: "chr2" },
  { identifier: "NC_000003.12", shorthand: "chr3" },
  { identifier: "NC_000004.12", shorthand: "chr4" },
  { identifier: "NC_000005.10", shorthand: "chr5" },
  { identifier: "NC_000006.12", shorthand: "chr6" },
  { identifier: "NC_000007.14", shorthand: "chr7" },
  { identifier: "NC_000008.11", shorthand: "chr8" },
  { identifier: "NC_000009.12", shorthand: "chr9" },
  { identifier: "NC_000010.11", shorthand: "chr10" },
  { identifier: "NC_000011.10", shorthand: "chr11" },
  { identifier: "NC_000012.12", shorthand: "chr12" },
  { identifier: "NC_000013.11", shorthand: "chr13" },
  { identifier: "NC_000014.9", shorthand: "chr14" },
  { identifier: "NC_000015.10", shorthand: "chr15" },
  { identifier: "NC_000016.10", shorthand: "chr16" },
  { identifier: "NC_000017.11", shorthand: "chr17" },
  { identifier: "NC_000018.10", shorthand: "chr18" },
  { identifier: "NC_000019.10", shorthand: "chr19" },
  { identifier: "NC_000020.11", shorthand: "chr20" },
  { identifier: "NC_000021.9", shorthand: "chr21" },
  { identifier: "NC_000022.11", shorthand: "chr22" },
  { identifier: "NC_000023.11", shorthand: "chrX" },
  { identifier: "NC_000024.10", shorthand: "chrY" },
];

interface Props {
  fieldValue: string;
  width?: number | undefined;
  editable?: boolean;
  onChange?: (
    event: ChangeEvent<{ name?: string; value: unknown }>,
    child: ReactNode
  ) => void;
}

const ChromosomeField: React.FC<Props> = ({
  fieldValue,
  editable = true,
  onChange,
}) => {
  return (
    <HelpTooltip
      placement="left"
      title={
        <>
          <Typography>The chromosome on which the segment lies.</Typography>
          <Typography>
            Only GRCh38 RefSeq identifiers (e.g.{" "}
            <Typography variant="overline">NC_000001.11</Typography>) are
            supported.
          </Typography>
        </>
      }
    >
      <FormControl variant="standard">
        <InputLabel id="chromosome-select-label">Chromosome</InputLabel>
        <Select
          labelId="chromosome-select-label"
          value={fieldValue}
          onChange={onChange}
          disabled={!editable}
          style={{ width: 270 }}
        >
          {REFSEQ_CHROMOSOME_IDENTIFIERS.map((chr) => (
            <MenuItem key={chr.identifier} value={chr.identifier}>
              {chr.identifier} (GRCh38:{chr.shorthand})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </HelpTooltip>
  );
};

export default ChromosomeField;
