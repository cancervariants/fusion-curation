import React from "react";
import "./App.scss";
import {
  Box,
  Typography,
  makeStyles,
  Link,
  Button,
  Drawer,
} from "@material-ui/core";
import {
  ClientAssayedFusion,
  ClientCategoricalFusion,
} from "../../../services/ResponseModels";
import { v4 as uuid } from "uuid";

const demoAssayedFusion: ClientAssayedFusion = {
  type: "AssayedFusion",
  structural_elements: [
    {
      type: "GeneElement",
      gene_descriptor: {
        type: "GeneDescriptor",
        id: "normalize.gene:EWSR1",
        label: "EWSR1",
        gene_id: "hgnc:3508",
      },
      element_id: uuid(),
      nomenclature: "EWSR1(hgnc:3508)",
    },
    {
      type: "UnknownGeneElement",
      element_id: uuid(),
      nomenclature: "?",
    },
  ],
  causative_event: {
    type: "CausativeEvent",
    event_type: "rearrangement",
  },
  assay: {
    type: "Assay",
    method_uri: "pmid:33576979",
    assay_id: "obi:OBI_0003094",
    assay_name: "fluorescence in-situ hybridization assay",
    fusion_detection: "inferred",
  },
};

const demoCategoricalFusion: ClientCategoricalFusion = {
  type: "CategoricalFusion",
  critical_functional_domains: [],
  structural_elements: [
    {
      type: "TranscriptSegmentElement",
      element_id: uuid(),
      nomenclature: "NM_002529.3(TPM3):e.8",
      input_type: "exon_coords_tx",
      transcript: "refseq:NM_152263.3",
      input_tx: "NM_152263.3",
      exon_end: 8,
      exon_end_offset: 0,
      gene_descriptor: {
        id: "normalize.gene:TPM3",
        type: "GeneDescriptor",
        label: "TPM3",
        gene_id: "hgnc:12012",
      },
      element_genomic_end: {
        id: "fusor.location_descriptor:NC_000001.11",
        type: "LocationDescriptor",
        label: "NC_000001.11",
        location: {
          type: "SequenceLocation",
          sequence_id: "refseq:NC_000001.11",
          interval: {
            type: "SequenceInterval",
            start: {
              type: "Number",
              value: 154170399,
            },
            end: {
              type: "Number",
              value: 154170400,
            },
          },
        },
      },
    },
    {
      type: "TranscriptSegmentElement",
      element_id: uuid(),
      nomenclature: "NM_002609.3(PDGFRB):e.11",
      input_type: "exon_coords_tx",
      transcript: "refseq:NM_002609.3",
      input_tx: "NM_002609.3",
      exon_start: 11,
      exon_start_offset: 0,
      gene_descriptor: {
        id: "normalize.gene:PDGFRB",
        type: "GeneDescriptor",
        label: "PDGFRB",
        gene_id: "hgnc:8804",
      },
      element_genomic_start: {
        id: "fusor.location_descriptor:NC_000005.10",
        type: "LocationDescriptor",
        label: "NC_000005.10",
        location: {
          type: "SequenceLocation",
          sequence_id: "refseq:NC_000005.10",
          interval: {
            type: "SequenceInterval",
            start: {
              type: "Number",
              value: 150125577,
            },
            end: {
              type: "Number",
              value: 150125578,
            },
          },
        },
      },
    },
  ],
};

const useStyles = makeStyles(() => ({
  menuLink: {
    marginBottom: "15px",
  },
  menuHeader: {
    marginTop: "30px",
  },
}));

interface AppMenuProps {
  open?: boolean;
  handleDemo?: any;
}

export default function AppMenu(props: AppMenuProps): React.ReactElement {
  const classes = useStyles();
  return (
    <Drawer
      variant="permanent"
      open={props.open}
      anchor="left"
      className="menu-drawer"
    >
      <Box ml="10px">
        <Link href="/" color="inherit">
          <h3>VICC Fusion Curation</h3>
        </Link>
        <Box className={`${classes.menuHeader} ${classes.menuLink}`}>
          <Typography variant="h6" color="inherit">
            <b>Tools</b>
          </Typography>
        </Box>
        <Box ml="10px">
          <Box className={classes.menuLink}>
            <Link href="/assayed-fusion" color="inherit">
              Assayed Fusion Tool
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link href="/categorical-fusion" color="inherit">
              Categorical Fusion Tool
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link href="/utilities" color="inherit">
              Utilities
            </Link>
          </Box>
        </Box>

        <Box className={`${classes.menuHeader} ${classes.menuLink}`}>
          <Typography variant="h6" color="inherit">
            <b>Resources</b>
          </Typography>
        </Box>
        <Box ml="10px">
          <Box className={classes.menuLink}>
            <Link
              href="https://fusions.cancervariants.org/en/latest/"
              target="_blank"
              color="inherit"
            >
              Fusions Home Page
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link
              href="https://github.com/cancervariants/fusion-curation"
              target="_blank"
              color="inherit"
            >
              Code Repository
            </Link>
          </Box>
          <Box className={classes.menuLink}>
            <Link
              href="https://cancervariants.org/"
              target="_blank"
              color="inherit"
            >
              VICC
            </Link>
          </Box>
        </Box>
        <Button
          color="inherit"
          onClick={() => props.handleDemo(demoAssayedFusion)}
        >
          use assay demo
        </Button>
        <Button
          color="inherit"
          onClick={() => props.handleDemo(demoCategoricalFusion)}
        >
          use categorical demo
        </Button>
      </Box>
    </Drawer>
  );
}
