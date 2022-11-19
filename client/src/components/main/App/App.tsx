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
  makeStyles,
  Popover,
  ThemeProvider,
} from "@material-ui/core";
// global contexts
import { DomainOptionsContext } from "../../../global/contexts/DomainOptionsContext";
import { FusionContext } from "../../../global/contexts/FusionContext";
import { GeneContext } from "../../../global/contexts/GeneContext";
import { SuggestionContext } from "../../../global/contexts/SuggestionContext";
// style things
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";
import "../../../global/styles/global.scss";
import theme, { MARGIN_OFFSETS } from "../../../global/styles/theme";
import "./App.scss";
// other components
import UtilitiesNavTabs from "../../../components/Utilities/UtilitiesNavTabs/UtilitiesNavTabs";
import NavTabs from "../Nav/NavTabs";
import About from "../About/About";
// services things
import {
  ClientElementUnion,
  getAssociatedDomains,
} from "../../../services/main";
import {
  ClientAssayedFusion,
  ClientCategoricalFusion,
  DomainParams,
  GeneDescriptor,
} from "../../../services/ResponseModels";
import LandingPage from "../Landing/LandingPage";
import AppMenu from "./AppMenu";
import DemoDropdown from "./DemoDropdown";
import { HelpPopover } from "../shared/HelpPopover/HelpPopover";
import PopoverTypography from "../shared/HelpPopover/PopoverTypography";
import PopoverLink from "../shared/HelpPopover/PopoverLink";

type ClientFusion = ClientCategoricalFusion | ClientAssayedFusion;

type GenesLookup = Record<string, GeneDescriptor>;
type DomainOptionsLookup = Record<string, DomainParams[]>;

const path = window.location.pathname;

const defaultFusion: ClientFusion = {
  structural_elements: [],
  type: path.includes("/assayed-fusion")
    ? "AssayedFusion"
    : "CategoricalFusion",
};

const App = (): JSX.Element => {
  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<ClientFusion>(defaultFusion);
  const [globalGenes, setGlobalGenes] = useState<GenesLookup>({});
  const [domainOptions, setDomainOptions] = useState<DomainOptionsLookup>({});
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogCallback, setDialogCallback] = useState<CallableFunction | null>(
    null
  );
  const [selectedDemo, setSelectedDemo] = React.useState("");

  // TODO: implement open/closing of AppMenu. This variable will become a state variable
  const open = true;
  const leftMarginOffset = open ? `${MARGIN_OFFSETS.appContent}px` : "0";

  /**
   * Update global genes contexts.
   * Critical domain options are predicated on genes enumerated within structural and
   * regulatory elements.
   */
  useEffect(() => {
    const newGenes = {};
    const remainingGeneIds: Array<string> = [];
    fusion.structural_elements.forEach((comp: ClientElementUnion) => {
      if (
        comp &&
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
    if (fusion.regulatory_element) {
      if (fusion.regulatory_element.associated_gene?.gene_id) {
        remainingGeneIds.push(
          fusion.regulatory_element.associated_gene.gene_id
        );
        if (
          !(fusion.regulatory_element.associated_gene.gene_id in globalGenes)
        ) {
          newGenes[fusion.regulatory_element.associated_gene.gene_id] =
            fusion.regulatory_element.associated_gene;
        }
      }
    }
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
  const useStyles = makeStyles(() => ({
    titleBox: {
      display: "flex",
    },
  }));
  const classes = useStyles();

  /**
   * Check if user has submitted any data.
   * This could easily be a messy one-liner, but it's distributed out for
   * readability.
   */
  const fusionIsEmpty = () => {
    if (fusion?.structural_elements.length === 0) {
      return true;
    } else if (fusion.structural_elements.length > 0) {
      return false;
    } else if (fusion.regulatory_element) {
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
      setDialogCallback(() => () => {
        setFusion(defaultFusion);
        setSelectedDemo("none");
      });
      setDialogOpen(true);
    }
  };

  const handleDemo = (
    fusion: ClientAssayedFusion | ClientCategoricalFusion,
    userSelectedFusion: string
  ) => {
    if (fusionIsEmpty()) {
      setFusion(fusion);
      setSelectedDemo(userSelectedFusion);
    } else {
      setDialogCallback(() => () => {
        setFusion(fusion);
        setSelectedDemo(userSelectedFusion);
      });
      setDialogOpen(true);
    }
  };

  const handleDialogResponse = (proceed: boolean) => {
    setDialogOpen(false);
    if (proceed && dialogCallback) {
      dialogCallback();
    }
    setDialogCallback(null);
  };

  let title = "";
  let displayTool = false;
  switch (path) {
    case "/assayed-fusion":
      title = "Assayed Fusion";
      displayTool = true;
      break;
    case "/categorical-fusion":
      title = "Categorical Fusion";
      displayTool = true;
      break;
    case "/utilities":
      title = "Utilities";
      displayTool = true;
      break;
  }

  const fusionsComponent = (
    <Box mt="75px" style={{ minHeight: "100vh" }}>
      {path !== "/utilities" ? (
        <GeneContext.Provider value={{ globalGenes, setGlobalGenes }}>
          <DomainOptionsContext.Provider
            value={{ domainOptions, setDomainOptions }}
          >
            <SuggestionContext.Provider value={[suggestions, setSuggestions]}>
              <FusionContext.Provider value={{ fusion, setFusion }}>
                <NavTabs handleClear={handleClear} />
              </FusionContext.Provider>
            </SuggestionContext.Provider>
          </DomainOptionsContext.Provider>
        </GeneContext.Provider>
      ) : (
        <UtilitiesNavTabs />
      )}
    </Box>
  );
  const categoricalHelpText = (
    <>
      <PopoverTypography>
        Categorical gene fusions are generalized concepts representing a class
        of fusions by their shared attributes, such as retained or lost
        regulatory elements and/or functional domains, and are typically curated
        from the biomedical literature for use in genomic knowledgebases.
      </PopoverTypography>
      <PopoverTypography>
        See the{" "}
        <PopoverLink href="https://fusions.cancervariants.org/en/latest/terminology.html#categorical-gene-fusions">
          specification
        </PopoverLink>{" "}
        for more information.
      </PopoverTypography>
    </>
  );

  const assayedHelpText = (
    <>
      <PopoverTypography>
        Assayed gene fusions from biological specimens are directly detected
        using RNA-based gene fusion assays, or alternatively may be inferred
        from genomic rearrangements detected by whole genome sequencing or
        cytogenomic assays in the context of informative phenotypic biomarkers.
      </PopoverTypography>
      <PopoverTypography>
        See the{" "}
        <PopoverLink href="https://fusions.cancervariants.org/en/latest/terminology.html#assayed-gene-fusions">
          specification
        </PopoverLink>{" "}
        for more information.
      </PopoverTypography>
    </>
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <div
          className="app-main"
          style={
            {
              ...colorTheme,
            } as React.CSSProperties
          }
        >
          <AppBar
            style={{
              width: "100%",
              height: "50px",
              marginLeft: "225px",
              display: title === "" ? "none" : "",
              backgroundColor: theme.colors.viccBlue,
            }}
          >
            <Box
              ml={leftMarginOffset}
              display="flex"
              justifyContent="space-between"
            >
              <Box className={classes.titleBox}>
                <h3>{title}</h3>
                {path.includes("utilities") ? (
                  <></>
                ) : (
                  <Box mt="12px" ml="5px">
                    <HelpPopover
                      iconStyle={{ color: colorTheme["--background"] }}
                      backgroundStyle={{
                        backgroundColor: colorTheme["--drawer-background"],
                      }}
                    >
                      {path.includes("/assayed-fusion")
                        ? assayedHelpText
                        : categoricalHelpText}
                    </HelpPopover>
                  </Box>
                )}
              </Box>
              <Box display={path === "/utilities" ? "none" : ""}>
                <DemoDropdown
                  handleClear={handleClear}
                  handleDemo={handleDemo}
                  selectedDemo={selectedDemo}
                />
              </Box>
            </Box>
          </AppBar>
          <AppMenu />
          <Box ml={leftMarginOffset} mr="15px" width="100%">
            {displayTool ? fusionsComponent : <LandingPage />}
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
