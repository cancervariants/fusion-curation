/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "./Summary.scss";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import React, { useContext, useEffect, useState } from "react";
import { Button, Tabs, Tab } from "@material-ui/core/";
import { Readable } from "../Readable/Readable";
import { SummaryJSON } from "../JSON/SummaryJSON";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";

import {
  ClientElementUnion,
  ElementUnion,
  validateFusion,
} from "../../../../services/main";
import {
  AssayedFusion,
  CategoricalFusion,
  FunctionalDomain,
  GeneElement,
  LinkerElement,
  MultiplePossibleGenesElement,
  TemplatedSequenceElement,
  TranscriptSegmentElement,
  UnknownGeneElement,
} from "../../../../services/ResponseModels";

interface Props {
  index: number;
}

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

export const Summary: React.FC<Props> = ({ index }) => {
  const { colorTheme } = useColorTheme();

  const [validatedFusion, setValidatedFusion] = useState<
    AssayedFusion | CategoricalFusion | null
  >(null);
  const [validationErrors, setValidationErrors] = useState<string[] | null>(
    null
  );
  const { fusion } = useContext(FusionContext);

  const [currentTab, setCurrentTab] = useState(0);

  /**
   * On component render, restructure fusion to drop properties used for client state purposes,
   * transmit to validation endpoint, and update local copy.
   */
  useEffect(() => {
    const structuralElements: ElementUnion[] = fusion.structural_elements?.map(
      (element: ClientElementUnion) => {
        switch (element.type) {
          case "GeneElement":
            const geneElement: GeneElement = {
              type: element.type,
              gene_descriptor: element.gene_descriptor,
            };
            return geneElement;
          case "LinkerSequenceElement":
            const linkerElement: LinkerElement = {
              type: element.type,
              linker_sequence: element.linker_sequence,
            };
            return linkerElement;
          case "TemplatedSequenceElement":
            const templatedSequenceElement: TemplatedSequenceElement = {
              type: element.type,
              region: element.region,
              strand: element.strand,
            };
            return templatedSequenceElement;
          case "TranscriptSegmentElement":
            const txSegmentElement: TranscriptSegmentElement = {
              type: element.type,
              transcript: element.transcript,
              exon_start: element.exon_start,
              exon_start_offset: element.exon_start_offset,
              exon_end: element.exon_end,
              exon_end_offset: element.exon_end_offset,
              gene_descriptor: element.gene_descriptor,
              element_genomic_start: element.element_genomic_start,
              element_genomic_end: element.element_genomic_end,
            };
            return txSegmentElement;
          case "MultiplePossibleGenesElement":
          case "UnknownGeneElement":
            const newElement:
              | MultiplePossibleGenesElement
              | UnknownGeneElement = {
              type: element.type,
            };
            return newElement;
          default:
            throw new Error("Unrecognized element type");
        }
      }
    );
    const regulatoryElements = fusion.regulatory_elements?.map((re) => ({
      type: re.type,
      associated_gene: re.associated_gene,
      regulatory_class: re.regulatory_class,
      feature_id: re.feature_id,
      genomic_location: re.genomic_location,
    }));
    let formattedFusion: AssayedFusion | CategoricalFusion;
    if (fusion.type === "AssayedFusion") {
      formattedFusion = {
        ...fusion,
        structural_elements: structuralElements,
        regulatory_elements: regulatoryElements,
      };
    } else {
      const criticalDomains: FunctionalDomain[] =
        fusion.critical_functional_domains?.map((domain) => ({
          _id: domain._id,
          label: domain.label,
          status: domain.status,
          associated_gene: domain.associated_gene,
          sequence_location: domain.sequence_location,
        }));
      formattedFusion = {
        ...fusion,
        structural_elements: structuralElements,
        regulatory_elements: regulatoryElements,
        critical_functional_domains: criticalDomains,
      };
    }

    // make request
    validateFusion(formattedFusion).then((response) => {
      if (response.warnings && response.warnings?.length > 0) {
        if (
          validationErrors !== null &&
          JSON.stringify(response.warnings.sort()) !==
            JSON.stringify(validationErrors.sort())
        ) {
          setValidationErrors(response.warnings);
        }
      } else {
        setValidationErrors([]);
        setValidatedFusion(
          response.fusion as CategoricalFusion | AssayedFusion
        );
      }
    });
  }, [fusion]); // should be blank?

  const handleTabChange = (event, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="summary-tab-container">
      {validationErrors !== null && validationErrors.length === 0 ? (
        <div className="summary-sub-tab-container">
          <div className="summary-nav">
            <Tabs
              TabIndicatorProps={{
                style: { backgroundColor: colorTheme["--primary"] },
              }}
              value={currentTab}
              onChange={handleTabChange}
              centered
            >
              <Tab label="Summary" />
              <Tab label="JSON" />
            </Tabs>
          </div>
          <TabPanel value={currentTab} index={0}>
            <div className="summary-sub-tab">
              {validatedFusion && <Readable fusion={validatedFusion} />}
            </div>
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <div className="summary-sub-tab">
              {validatedFusion && <SummaryJSON fusion={validatedFusion} />}
            </div>
          </TabPanel>
        </div>
      ) : (
        <div className="error-container">
          {validationErrors !== null ? (
            validationErrors.map((error: string, index: number) => {
              return (
                <div key={index}>
                  <p>{error}</p>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
};
