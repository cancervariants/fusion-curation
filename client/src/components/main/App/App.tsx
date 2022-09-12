import React, { useEffect, useState } from "react";
// m-ui things
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Link,
  Menu,
  MenuItem,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
// global contexts
import { DomainOptionsContext } from "../../../global/contexts/DomainOptionsContext";
import { FusionContext } from "../../../global/contexts/FusionContext";
import { GeneContext } from "../../../global/contexts/GeneContext";
import { SuggestionContext } from "../../../global/contexts/SuggestionContext";
// style things
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";
import "../../../global/styles/global.scss";
import theme from "../../../global/styles/theme";
import "./App.scss";
// other components
import UtilitiesNavTabs from "../../../components/Utilities/UtilitiesNavTabs/UtilitiesNavTabs";
import NavTabs from "../Nav/NavTabs";
import About from "../About/About";
// services things
import { v4 as uuid } from "uuid";
import { getAssociatedDomains } from "../../../services/main";
import {
  ClientAssayedFusion,
  ClientCategoricalFusion,
  ClientGeneElement,
  ClientLinkerElement,
  ClientMultiplePossibleGenesElement,
  ClientTemplatedSequenceElement,
  ClientTranscriptSegmentElement,
  ClientUnknownGeneElement,
  DomainParams,
  GeneDescriptor,
  RegulatoryElement,
} from "../../../services/ResponseModels";

type ClientFusion = ClientCategoricalFusion | ClientAssayedFusion;
type ClientElement =
  | ClientTranscriptSegmentElement
  | ClientGeneElement
  | ClientUnknownGeneElement
  | ClientMultiplePossibleGenesElement
  | ClientLinkerElement
  | ClientTemplatedSequenceElement;

type GenesLookup = Record<string, GeneDescriptor>;
type DomainOptionsLookup = Record<string, DomainParams[]>;

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
      element_name: "EWSR1(hgnc:3508)",
      hr_name: "EWSR1(hgnc:3508)",
    },
    {
      type: "UnknownGeneElement",
      element_id: uuid(),
      element_name: "?",
      hr_name: "?",
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
  regulatory_elements: [],
};

const demoCategoricalFusion: ClientCategoricalFusion = {
  type: "CategoricalFusion",
  critical_functional_domains: [],
  structural_elements: [
    {
      type: "TranscriptSegmentElement",
      element_id: uuid(),
      element_name: "NM_152263.3 TPM3",
      hr_name: "NM_002529.3(TPM3):e.8",
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
      element_name: "NM_002609.3 PDGFRB",
      hr_name: "NM_002609.3(PDGFRB):e.11",
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
  regulatory_elements: [],
};

const path = window.location.pathname

const defaultFusion: ClientFusion = {
  structural_elements: [],
  regulatory_elements: [],
  type: path === "/assayed-fusion" ? "AssayedFusion" : "CategoricalFusion"
};

const App = (): JSX.Element => {
  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<ClientFusion>(defaultFusion);
  const [globalGenes, setGlobalGenes] = useState<GenesLookup>({});
  const [domainOptions, setDomainOptions] = useState<DomainOptionsLookup>({});
  const [showMain, setShowMain] = useState<boolean>(true);
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogCallback, setDialogCallback] = useState<CallableFunction | null>(
    null
  );
  const [open, setOpen] = React.useState(true);

  /**
   * Update global genes contexts.
   * Critical domain options are predicated on genes enumerated within structural and
   * regulatory elements.
   */
  useEffect(() => {
    const newGenes = {};
    const remainingGeneIds: Array<string> = [];
    fusion.structural_elements.forEach((comp: ClientElement) => {
      if (
        comp.type &&
        (comp.type === "GeneElement" ||
          comp.type === "TranscriptSegmentElement") &&
        comp.gene_descriptor?.gene_id
      ) {
        remainingGeneIds.push(comp.gene_descriptor.gene_id);
        if (
          comp.gene_descriptor.gene_id &&
          !(comp.gene_descriptor.gene_id in globalGenes)
        ) {
          newGenes[comp.gene_descriptor.gene_id] = comp.gene_descriptor;
        }
      }
    });
    fusion.regulatory_elements?.forEach((re: RegulatoryElement) => {
      if (re.associated_gene?.gene_id) {
        remainingGeneIds.push(re.associated_gene.gene_id);
        if (!(re.associated_gene.gene_id in globalGenes)) {
          newGenes[re.associated_gene.gene_id] = re.associated_gene;
        }
      }
    });
    const uniqueRemainingGeneIds: Array<string> = remainingGeneIds.filter(
      (geneId, index) => remainingGeneIds.indexOf(geneId) === index
    );

    const geneContextCopy: GenesLookup = {};
    uniqueRemainingGeneIds.forEach((geneId: string) => {
      if (geneId in globalGenes) {
        geneContextCopy[geneId] = globalGenes[geneId];
      } else {
        geneContextCopy[geneId] = newGenes[geneId];
      }
    });
    setGlobalGenes(geneContextCopy);
  }, [fusion]);

  // update domain options based on available genes
  useEffect(() => {
    const updatedDomainOptions: DomainOptionsLookup = {};
    Object.keys(globalGenes).forEach((geneId: string) => {
      if (geneId) {
        if (geneId in domainOptions) {
          updatedDomainOptions[geneId] = domainOptions[geneId];
        } else {
          getAssociatedDomains(geneId).then((response) => {
            updatedDomainOptions[geneId] = response.suggestions || [];
          });
        }
      }
    });
    setDomainOptions(updatedDomainOptions);
  }, [globalGenes]);

  // disable superfluous react_dnd warnings
  // window["__react-beautiful-dnd-disable-dev-warnings"] = true;

  const { colorTheme } = useColorTheme();

  /**
   * Check if user has submitted any data.
   * This could easily be a messy one-liner, but it's distributed out for
   * readability.
   */
  const fusionIsEmpty = () => {
    if (fusion.type) {
      return false;
    } else if (fusion.structural_elements.length > 0) {
      return false;
    } else if (
      fusion.regulatory_elements &&
      fusion.regulatory_elements.length > 0
    ) {
      return false;
    } else if (fusion.type == "AssayedFusion") {
      if (
        fusion.assay &&
        (fusion.assay.assay_name ||
          fusion.assay.assay_id ||
          fusion.assay.method_uri ||
          fusion.assay.fusion_detection)
      ) {
        return false;
      }
      if (
        fusion.causative_event &&
        (fusion.causative_event.event_type ||
          fusion.causative_event.event_description)
      ) {
        return false;
      }
    } else if (fusion.type == "CategoricalFusion") {
      if (fusion.r_frame_preserved !== undefined) {
        return false;
      }
      if (
        fusion.critical_functional_domains &&
        fusion.critical_functional_domains.length > 0
      ) {
        return false;
      }
    }
    return true;
  };

  const handleClear = () => {
    if (fusionIsEmpty()) {
      setFusion(defaultFusion);
    } else {
      setDialogCallback(() => () => setFusion(defaultFusion));
      setDialogOpen(true);
    }
  };

  const handleDemo = (
    fusion: ClientAssayedFusion | ClientCategoricalFusion
  ) => {
    if (fusionIsEmpty()) {
      setFusion(fusion);
    } else {
      setDialogCallback(() => () => setFusion(fusion));
      setDialogOpen(true);
    }
  };

  const handleShowMainClick = () => {
    setShowMain(!showMain);
  };

  const handleServiceInfo = () => {
    setShowServiceInfo(true);
  };

  const handleDialogResponse = (proceed: boolean) => {
    setDialogOpen(false);
    if (proceed && dialogCallback) {
      dialogCallback();
    }
    setDialogCallback(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  document.title = "VICC Fusion Curation";

  const fusionsComponent = (
    <div className="main-component">
          {path !== "/utilities" ? (
            <GeneContext.Provider value={{ globalGenes, setGlobalGenes }}>
              <DomainOptionsContext.Provider
                value={{ domainOptions, setDomainOptions }}
              >
                <SuggestionContext.Provider
                  value={[suggestions, setSuggestions]}
                >
                  <FusionContext.Provider value={{ fusion, setFusion }}>
                    <NavTabs />
                  </FusionContext.Provider>
                </SuggestionContext.Provider>
              </DomainOptionsContext.Provider>
            </GeneContext.Provider>
          ) : (
            <UtilitiesNavTabs />
          )}
        </div>
  )

  return (
    <>
    <ThemeProvider theme={theme}>
      <div
        className={showMain ? "app-main" : "app-utils"}
        style={
          {
            ...colorTheme,
          } as React.CSSProperties
        }
      >
        {/* <Box display='flex'>
        <div className="title">
          <Link href="/" style={{ color: "white" }}><h2>VICC Fusion Curation {showMain ? "Interface" : "Utilities"}</h2></Link>
        
        <div className="menu-container">
          <Button
            variant="contained"
            color="secondary"
            onClick={(event) => setAnchorEl(event.currentTarget)}>
              Menu
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {showMain ? (
              <div>
                <MenuItem onClick={() => handleClear()}>
                  Clear Entered Data
                </MenuItem>
                <MenuItem onClick={() => handleDemo(demoAssayedFusion)}>
                  Use Assayed Fusion Demo
                </MenuItem>
                <MenuItem onClick={() => handleDemo(demoCategoricalFusion)}>
                  Use Categorical Fusion Demo
                </MenuItem>
                <MenuItem onClick={() => handleShowMainClick()}>
                  Utilities
                </MenuItem>
              </div>
            ) : (
              <MenuItem onClick={() => handleShowMainClick()}>
                Return to Curation
              </MenuItem>
            )}
            <MenuItem onClick={() => handleServiceInfo()}>About</MenuItem>
          </Menu>
        </div>
        </div>
        </Box> */}
        <AppBar style={{ width: "100%", height: "50px" }}>
          <Box m="auto">TITLE</Box>
        </AppBar>
        <Drawer variant="permanent" open={open} anchor="left" className="menu-drawer">
          <div className="title">
          <Link href="/"><h2>VICC Fusion Curation {showMain ? "Interface" : "Utilities"}</h2></Link>
          </div>
          <Box ml="10px">
            <h3>Tools</h3>
            <Box ml="10px">
              <Box mb="10px"><Link href="/assayed-fusion">Assayed Fusion Tool</Link></Box>
              <Box mb="10px"><Link href="/categorical-fusion">Categorical Fusion Tool</Link></Box>
              <Box mb="10px"><Link href="/utilities">Utilities</Link></Box>
            </Box>
          
            <h3>Resources</h3>
            <Box ml="10px">
              <Box mb="10px"><Link href="https://cancervariants.org/projects/fusions/" target="_blank">Fusions Guidelines Home Page</Link></Box>
              <Box mb="10px"><Link href="https://github.com/cancervariants/fusion-curation" target="_blank">Code Repository</Link></Box>
              <Box mb="10px"><Link href="https://cancervariants.org/" target="_blank">VICC</Link></Box>
            </Box>
            <Button onClick={() => handleDemo(demoAssayedFusion)}>use assay demo</Button>
            <Button onClick={() => handleDemo(demoCategoricalFusion)}>use categorical demo</Button>
          </Box>
        </Drawer>
        <Box ml={open ? "260px" : "0"} mr="5px">
          {path === "/assayed-fusion" || path === "/categorical-fusion" || path === "/utilities" ? fusionsComponent : ""}
        </Box>
        
      </div>
      <About show={showServiceInfo} setShow={setShowServiceInfo} />
      <Dialog
        open={dialogOpen}
        onClose={() => handleDialogResponse(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Clear existing data?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Warning: This action will clear all existing data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogResponse(true)} color="primary">
            Proceed
          </Button>
          <Button
            onClick={() => handleDialogResponse(false)}
            color="primary"
            autoFocus
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
    </>
  );
};

export default App;
