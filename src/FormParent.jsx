/* eslint-disable react/jsx-no-bind */
/* eslint-disable quotes */
/* eslint-disable dot-notation */
import {
  React, useState, useEffect, useMemo,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import FormRadio from './FormRadio';
import CausativeEventForm from './CausEventForm';
import DomainsForm from './DomainsForm';
import SubmitButton from './SubmitButton';
import ResultField from './ResultField';
import ComponentsForm from './ComponentsForm';
import RegulatoryElementsForm from './RegulatoryElementsForm';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const FormParent = () => {
  const classes = useStyles();

  const [selections, setSelections] = useState({});
  const handleEntry = (field, value) => {
    setSelections({ ...selections, ...{ [field]: value } });
  };
  const [domains, setDomains] = useState([]);
  const [components, setComponents] = useState([]);
  const [regulatoryElements, setRegulatoryElements] = useState([]);

  // results handling
  // proposedFusion: client-created Fusion object
  // fusionJSON -- validated Fusion object received from server
  const [proposedFusion, setProposedFusion] = useState({});
  const [fusionJSON, setFusionJSON] = useState({});

  // ID/coordinate indices -- built from AJAX calls
  const [geneIndex, setGeneIndex] = useState({});
  const [domainIndex, setDomainIndex] = useState({});
  const [exonIndex, setExonIndex] = useState({});
  const [sequenceIndex, setSequenceIndex] = useState({});

  // visible will update when state updates
  const visible = useMemo(() => ({
    chimericTranscript: true,
    proteinCoding: selections['chimericTranscript'] === 'Yes',
    notValid: selections['nearRegulatory'] === 'No' && selections['chimericTranscript'] === 'No',
    rfPreserved: selections['proteinCoding'] === 'Yes' && selections['chimericTranscript'] === 'Yes',
    domains: selections['chimericTranscript'] === 'Yes' && selections['proteinCoding'] === 'Yes' && selections['rfPreserved'] === 'Yes',
    components: (selections['chimericTranscript'] === 'Yes' && selections['proteinCoding'] === 'No') || selections['rfPreserved'] !== undefined,
    causativeEventForm: selections['causativeEventKnown'] === 'Yes',
    nearRegulatory: (selections['causativeEventKnown'] !== undefined) || selections['chimericTranscript'] === 'No',
    regulatoryElements: selections['nearRegulatory'] === 'Yes',
    submit: selections['nearRegulatory'] !== undefined && selections['chimericTranscript'] === 'Yes' && selections['causativeEventKnown'] !== undefined,
    resultField: selections['submitted'] === true,
  }), [selections]);

  // when visible updates, anything not visible is also removed from state
  useEffect(() => {
    // eslint-disable-next-line array-callback-return
    Object.entries(visible).map(([key, value]) => {
      if (!value) {
        delete selections[key];
      }
    });
    setSelections(selections);
  }, [visible]);

  /**
   * Get ID for gene name. Updates geneIndex upon retrieval.
   * @param {string} symbol gene symbol to retrieve ID for
   */
  const getGeneID = (symbol) => {
    // eslint-disable-next-line consistent-return
    fetch(`/gene/${symbol}`).then((response) => response.json()).then((geneResponse) => {
      if (geneResponse.warnings && geneResponse.warnings.length !== 0) {
        return null;
      }
      const geneIndexCopy = geneIndex;
      geneIndexCopy[symbol] = geneResponse.concept_id;
      setGeneIndex(geneIndexCopy);
    });
  };

  /**
   * Get ID for functional domain. Updates domainIndex upon retrieval.
   * @param {string} name functional domain name to retrieve ID for
   */
  const getDomainID = (name) => {
    // eslint-disable-next-line consistent-return
    fetch(`/domain/${name}`)
      .then((response) => response.json())
      // eslint-disable-next-line
      .then((domainResponse) => {
        if (domainResponse.warnings && domainResponse.warnings.length !== 0) {
          return null;
        }
        const domainID = domainResponse.domain_id;
        const domainIndexCopy = domainIndex;
        domainIndexCopy[name] = domainID;
        setDomainIndex(domainIndexCopy);
      });
  };

  /**
   * Get exon's data
   * @param {string} txAc transcript accession
   * @param {string|number} startExon starting exon number
   * @param {string|number} endExon ending exon number
   * @param {string|number} startExonOffset starting exon's offset
   * @param {string|number} endExonOffset ending exon's offset
   * @param {string} [gene] gene symbol
   * @return Exon data
   */
  const getExon = (txAc, startExon, endExon, startExonOffset, endExonOffset, gene) => {
    let url = null;
    if (!gene) {
      url = `/coordinates/${txAc}/${startExon}/${endExon}/${startExonOffset}/${endExonOffset}`;
    } else {
      url = `/coordinates/${txAc}/${startExon}/${endExon}/${startExonOffset}/${endExonOffset}/${gene}`;
    }
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    // eslint-disable-next-line consistent-return
    }).then((response) => response.json()).then((exonResponse) => {
      if (exonResponse === null) {
        return null;
      }
      if (exonResponse.warnings && exonResponse.warnings.length !== 0) {
        return null;
      }
      const { chr, start, end } = exonResponse;
      const geneSymbol = exonResponse.gene;
      if (!gene) {
        const geneID = getGeneID(geneSymbol);
        const geneIndexCopy = geneIndex;
        if (geneID != null) {
          geneIndexCopy[geneSymbol] = geneID;
        }
      }

      const exonStart = exonResponse.start_exon;
      const exonEnd = exonResponse.end_exon;
      if (chr != null) {
        const exonIndexCopy = exonIndex;
        exonIndexCopy[txAc] = {
          geneSymbol,
          chr,
          start,
          end,
          exonStart,
          exonEnd,
          sequenceID: exonResponse.sequence_id,
        };
        setExonIndex(exonIndexCopy);
      }
    });
  };

  /**
   * Retrieve sequence ID from user-entered chromosome string [defaults to GRCh38]
   * @param {str} chr to retrieve ID for
   * @return nothing, but update index state variable
   */
  const getSequenceID = (chr) => {
    fetch(`/sequence/GRCh38:${chr}`)
      .then((response) => response.json())
      // eslint-disable-next-line
      .then((sequenceResponse) => {
        if (sequenceResponse.warnings && sequenceResponse.warnings.length !== 0) {
          return null;
        }
        const sequenceID = sequenceResponse.sequence_id;
        const sequenceIndexCopy = sequenceIndex;
        sequenceIndexCopy[chr] = sequenceID;
        setSequenceIndex(sequenceIndexCopy);
      });
  };

  /**
   *
   * @param {Object} fusion proposed fusion object constructed from user input
   */
  const validateFusion = (fusion) => {
    if (Object.keys(fusion).length !== 0) {
      fetch('/validate', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fusion),
      }).then((response) => response.json()).then((validationResponse) => {
        if (validationResponse.warnings.length > 0) {
          setFusionJSON({
            warnings: validationResponse.warnings,
          });
        } else {
          setFusionJSON(validationResponse.fusion);
        }
      });
    }
  };

  // hooks for performing ajax lookups + update ID/coordinate indices
  useEffect(() => {
    const geneIndexCopy = geneIndex;
    const exonIndexCopy = exonIndex;
    components.forEach((component) => {
      const values = component.componentValues;

      if (values.gene_symbol) {
        const geneSymbol = values.gene_symbol;
        if (!(geneSymbol in geneIndexCopy)) {
          const geneID = getGeneID(geneSymbol);
          if (geneID != null) {
            geneIndexCopy[geneSymbol] = geneID;
          }
        }
      }

      if (values.chr) {
        const { chr } = values;
        if (!(chr in sequenceIndex)) {
          getSequenceID(chr);
        }
      }

      if (values.transcript) {
        let exon = null;
        const exonStartOffset = values.exon_start_offset ? values.exon_start_offset : 0;
        const exonEndOffset = values.exon_end_offset ? values.exon_end_offset : 0;
        if (values.exon_start && !values.exon_end) {
          exon = getExon(values.transcript, values.exon_start, 0,
            exonStartOffset, exonEndOffset, values.gene_symbol);
        } else if (!values.exon_start && values.exon_end) {
          exon = getExon(values.transcript, 0, values.exon_end,
            exonStartOffset, exonEndOffset, values.gene_symbol);
        } else if (values.exon_start && values.exon_end) {
          exon = getExon(values.transcript, values.exon_start, values.exon_end,
            exonStartOffset, exonEndOffset, values.gene_symbol);
        } else {
          exon = getExon(values.transcript, 0, 0,
            exonStartOffset, exonEndOffset, values.gene_symbol);
        }
        if (exon != null) {
          exonIndexCopy[values.transcript] = exon;
        }
      }
    });

    setGeneIndex(geneIndexCopy);
    setExonIndex(exonIndexCopy);
  }, [components]);

  useEffect(() => {
    domains.forEach((domain) => {
      if (domain.gene && !(domain.gene in geneIndex)) getGeneID(domain.gene);
      if (domain.name && !(domain.name in domainIndex)) getDomainID(domain.name);
    });
  }, [domains]);

  useEffect(() => {
    regulatoryElements.forEach((element) => {
      if (element.gene && !(element.gene in geneIndex)) getGeneID(element.gene);
    });
  }, [regulatoryElements]);

  // fusion validation hook
  // useEffect(() => {
  //   validateFusion(proposedFusion);
  // }, [submitCount]);

  /**
   * Construct valid gene descriptor from given params
   * @param {str} label of gene
   * @param {str} normalizedID fetched from Gene Normalization service for label
   * @returns validly-structured GeneDescriptor object
   */
  const buildGeneDescriptor = (label, normalizedID) => ({
    type: 'GeneDescriptor',
    id: `gene:${label}`,
    label,
    gene_id: normalizedID,
  });

  /**
   * Create transcript_segment object given user input
   * @param {Object} component object corresponding to given component, as stored in state and
   *  filled out by user
   * @param {number} index location in state array - used to infer some coordinate defaults
   * @returns complete transcript_segment object
   */
  const transcriptSegmentComponentToJSON = (component) => {
    const transcriptSegment = { component_type: 'transcript_segment' };
    const values = component.componentValues;

    transcriptSegment.transcript = `refseq:${values.transcript}`;

    if (values.gene_symbol) {
      const symbol = values.gene_symbol;
      transcriptSegment.gene_descriptor = buildGeneDescriptor(symbol, geneIndex[symbol]);
    } else if (values.transcript in exonIndex && (typeof exonIndex[values.transcript].geneSymbol !== 'undefined')) {
      const symbol = exonIndex[values.transcript].geneSymbol;
      const geneID = geneIndex[symbol];
      transcriptSegment.gene_descriptor = buildGeneDescriptor(symbol, geneID);
    }

    // TODO handle differently based on index value
    const exon = exonIndex[values.transcript];
    if (exon) {
      transcriptSegment.exon_start = exon.exonStart;
      transcriptSegment.exon_start_offset = exon.exonStartOffset;
      transcriptSegment.exon_end = exon.exonEnd;
      transcriptSegment.exon_end_offset = exon.exonEndOffset;

      transcriptSegment.component_genomic_region = {
        id: `${exon.chr}:${exon.start}-${exon.end}`,
        type: 'LocationDescriptor',
        location: {
          sequence_id: exon.sequenceID,
          type: 'SequenceLocation',
          interval: {
            start: {
              type: 'Number',
              value: exon.start,
            },
            end: {
              type: 'Number',
              value: exon.end,
            },
            type: 'SequenceInterval',
          },
        },
      };
    }

    return transcriptSegment;
  };

  /**
   * Create genomic_region component object given user input
   * TODO may require new server endpoints/restructuring
   * @param {Object} component object corresponding to given component, as stored in state and
   *  filled out by user
   * @returns complete genomic_region object
   */
  const genomicRegionComponentToJSON = (component) => {
    const values = component.componentValues;
    const regionID = `chr${values.chr}:${values.start_pos}-${values.end_pos}(${values.strand})`;
    return {
      component_type: 'genomic_region',
      region: {
        id: regionID,
        type: 'LocationDescriptor',
        location: {
          type: 'SequenceLocation',
          sequence_id: sequenceIndex[values.chr],
          interval: {
            type: 'SequenceInterval',
            start: {
              type: 'Number',
              value: parseInt(values.start_pos, 10),
            },
            end: {
              type: 'Number',
              value: parseInt(values.end_pos, 10),
            },
          },
        },
        label: regionID,
      },
      strand: values.strand,
    };
  };

  /**
   * Create linker_sequence component object given user input
   * @param {Object} component object corresponding to given component, as stored in state and
   *  filled out by user
   * @returns complete linker_sequence object
   */
  const linkerSequenceComponentToJSON = (comp) => (
    {
      component_type: 'linker_sequence',
      linker_sequence: {
        id: `sequence:${comp.componentValues.sequence}`,
        type: 'SequenceDescriptor',
        sequence: comp.componentValues.sequence,
        residue_type: 'SO:0000348',
      },
    }
  );

  /**
   * Create gene component object given user input
   * @param {Object} component object corresponding to given component, as stored in state and
   *  filled out by user
   * @returns complete gene object
   */
  const geneComponentToJSON = (comp) => (
    {
      component_type: 'gene',
      gene_descriptor: buildGeneDescriptor(
        comp.componentValues.gene_symbol,
        geneIndex[comp.componentValues.gene_symbol],
      ),
    }
  );

  /**
   * Create unknown_gene component object given user input. Will likely need to take more
   * user input/provide more data.
   * @returns complete unknown_gene object
   */
  const unknownComponentToJSON = () => {
    const output = {
      component_type: 'unknown_gene',
    };
    return output;
  };

  // build proposedFusion
  useEffect(() => {
    const output = {};

    // functional domains
    if (selections['proteinCoding'] === 'Yes') {
      if (selections['rfPreserved'] === 'Yes') {
        output.r_frame_preserved = true;
        if (domains.length > 0) {
          output.protein_domains = domains.map((domain) => {
            const domainObject = {
              status: domain.status,
              name: domain.name,
            };
            if (domain.name) {
              domainObject.id = domainIndex[domain.name];
            }
            if (domain.gene) {
              domainObject.gene_descriptor = buildGeneDescriptor(
                domain.gene,
                geneIndex[domain.gene],
              );
            }
            return domainObject;
          });
        }
      } else if (selections['rfPreserved'] === 'No') {
        output.r_frame_preserved = false;
      }
    }

    // transcript components
    output.transcript_components = components.map((comp) => {
      if (comp.componentType === 'transcript_segment') {
        return transcriptSegmentComponentToJSON(comp);
      }
      if (comp.componentType === 'genomic_region') {
        return genomicRegionComponentToJSON(comp);
      }
      if (comp.componentType === 'linker_sequence') {
        return linkerSequenceComponentToJSON(comp);
      }
      if (comp.componentType === 'gene') {
        return geneComponentToJSON(comp);
      }
      if (comp.componentType === 'unknown_gene') {
        return unknownComponentToJSON();
      }
      return null;
    });

    // causative event
    if (selections['causativeEventKnown'] === 'Yes') {
      output.causative_event = selections['causativeEvent'];
    }

    // regulatory elements
    if (regulatoryElements && regulatoryElements.length > 0) {
      output.regulatory_elements = regulatoryElements.map((element) => {
        const elementFormatted = {};
        if (element.type) elementFormatted.type = element.type;
        if (element.gene) {
          const label = element.gene;
          elementFormatted.gene_descriptor = buildGeneDescriptor(label, geneIndex[label]);
        }
        return elementFormatted;
      });
    } else {
      output.regulatory_elements = [];
    }

    setProposedFusion(output);
  }, [selections, domains, components, regulatoryElements]);

  /**
   * Hackish way to tie async validation request to the submit onClick listener
   * TODO: Probably a better way to accomplish this
   */
  const handleSubmit = () => {
    handleEntry('submitted', true);
    validateFusion(proposedFusion);
  };

  return (
    <div className={classes.root}>
      <FormRadio
        name="chimericTranscript"
        prompt="Does the fusion create a chimeric transcript?"
        state={{
          options: ['Yes', 'No'],
          state: selections['chimericTranscript'],
          stateFunction: (oldValue, newValue) => handleEntry('chimericTranscript', newValue),
        }}
      />

      {visible['proteinCoding']
        ? (
          <FormRadio
            name="proteinCoding"
            prompt="Is at least one partner protein-coding?"
            state={{
              options: ['Yes', 'No', 'Unknown'],
              state: selections['proteinCoding'],
              stateFunction: (oldValue, newValue) => handleEntry('proteinCoding', newValue),
            }}
          />
        )
        : null}
      {visible['rfPreserved']
        ? (
          <FormRadio
            name="rfPreserved"
            prompt="Is the reading frame predicted to be preserved?"
            state={{
              options: ['Yes', 'No'],
              state: selections['rfPreserved'],
              stateFunction: (oldValue, newValue) => { handleEntry('rfPreserved', newValue); },
            }}
          />
        )
        : null}
      {visible['domains']
        ? <DomainsForm domains={domains} setDomains={setDomains} />
        : null}
      {visible['components']
        ? (
          <DndProvider backend={HTML5Backend}>
            <ComponentsForm components={components} setComponents={setComponents} />
          </DndProvider>
        )
        : null}
      {visible['components']
        ? (
          <FormRadio
            name="causativeEventKnown"
            prompt="Is causative event known?"
            state={{
              options: ['Yes', 'No'],
              state: selections['causativeEventKnown'],
              stateFunction: (oldValue, newValue) => { handleEntry('causativeEventKnown', newValue); },
            }}
          />
        )
        : null}
      {visible['causativeEventForm']
        ? (
          <CausativeEventForm
            state={selections['causativeEvent']}
            handler={handleEntry.bind({}, 'causativeEvent')}
          />
        )
        : null}
      {visible['nearRegulatory']
        ? (
          <FormRadio
            name="nearRegulatory"
            prompt="Does fusion rearrange near regulatory element?"
            state={{
              options: ['Yes', 'No'],
              state: selections['nearRegulatory'],
              stateFunction: (oldValue, newValue) => { handleEntry('nearRegulatory', newValue); },
            }}
          />
        )
        : null}
      {visible['regulatoryElements']
        ? (
          <RegulatoryElementsForm
            items={regulatoryElements}
            setItems={setRegulatoryElements}
          />
        )
        : null}
      {visible['notValid']
        ? (
          <Box p={1}>
            <Typography>
              Not a valid fusion
            </Typography>
          </Box>
        )
        : null}
      {visible['submit'] ? <SubmitButton handler={handleSubmit} /> : null}
      {visible['resultField']
        ? (
          <ResultField
            fusionJSON={fusionJSON}
          />
        )
        : null}
    </div>
  );
};

export default FormParent;
