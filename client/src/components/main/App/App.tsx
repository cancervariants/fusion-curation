import React, { useEffect, useState } from "react";
// m-ui things
import { Menu, MenuItem, ThemeProvider } from "@material-ui/core";
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
import ButtonTop from "../shared/Buttons/ButtonTop";
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
      element_name: "z",
      hr_name: "z",
    },
    {
      type: "UnknownGeneElement",
      element_id: uuid(),
      element_name: "z",
      hr_name: "z",
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

const defaultFusion: ClientFusion = {
  structural_elements: [],
  regulatory_elements: [],
};

const App = (): React.ReactElement => {
  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<ClientFusion>(defaultFusion);
  const [globalGenes, setGlobalGenes] = useState<unknown>({});
  const [domainOptions, setDomainOptions] = useState<unknown>({});
  const [showMain, setShowMain] = useState<boolean>(true);
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

    const geneContextCopy = {};
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
    const updatedDomainOptions = {};
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
  window["__react-beautiful-dnd-disable-dev-warnings"] = true;

  const { colorTheme } = useColorTheme();

  const handleClear = () => {
    setAnchorEl(null);
    setFusion(defaultFusion);
    setGlobalGenes({});
    setDomainOptions({});
  };

  const handleDemo = () => {
    setAnchorEl(null);
    setFusion(demoAssayedFusion);
  };

  const handleShowMainClick = () => {
    setAnchorEl(null);
    setShowMain(!showMain);
  };

  const handleServiceInfo = () => {
    setAnchorEl(null);
    setShowServiceInfo(true);
  };

  document.title = "VICC Fusion Curation";

  return (
    <ThemeProvider theme={theme}>
      <div
        className={showMain ? "app-main" : "app-utils"}
        style={
          {
            ...colorTheme,
          } as React.CSSProperties
        }
      >
        <div className="menu-container">
          <ButtonTop
            text="Menu"
            variant="contained"
            color="secondary"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          />
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
                <MenuItem onClick={() => handleDemo()}>Use Demo Data</MenuItem>
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
        <h1 className="title">
          VICC Fusion Curation {showMain ? "Interface" : "Utilities"}
        </h1>
        <div className="main-component">
          {showMain ? (
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
      </div>
      <About show={showServiceInfo} setShow={setShowServiceInfo} />
    </ThemeProvider>
  );
};

export default App;
