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
import ResponseField from './ResponseField';
import ComponentsForm from './ComponentsForm';
import RegulatoryElementsForm from './RegulatoryElementsForm';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const FormParent = () => {
  const classes = useStyles();

  const [responses, setResponses] = useState({});

  const handleResponse = (field, value) => {
    setResponses({ ...responses, ...{ [field]: value } });
  };

  const [domains, setDomains] = useState([]);
  const [regulatoryElements, setRegulatoryElements] = useState([]);

  // TODO need default value to make controlled/uncontrolled error go away?
  const [components, setComponents] = useState([]);
  const [responseJSON, setResponseJSON] = useState('{}');
  const [responseHuman, setResponseHuman] = useState('');

  // ajax values
  const [geneIndex, setGeneIndex] = useState({});
  const [domainIndex, setDomainIndex] = useState({});
  const [exonIndex, setExonIndex] = useState({});

  // visible will update when state updates
  const visible = useMemo(() => ({
    chimericTranscript: true,
    proteinCoding: responses['chimericTranscript'] === 'Yes',
    notValid: responses['nearRegulatory'] === 'No' && responses['chimericTranscript'] === 'No',
    rfPreserved: responses['proteinCoding'] === 'Yes' && responses['chimericTranscript'] === 'Yes',
    domains: responses['chimericTranscript'] === 'Yes' && responses['proteinCoding'] === 'Yes' && responses['rfPreserved'] === 'Yes',
    components: responses['chimericTranscript'] === 'Yes' && (responses['proteinCoding'] === 'No' || responses['rfPreserved'] !== undefined),
    causativeEventKnown: responses['chimericTranscript'] === 'Yes' && responses['proteinCoding'] !== undefined,
    causativeEventForm: responses['causativeEventKnown'] === 'Yes' && responses['chimericTranscript'] === 'Yes',
    nearRegulatory: (responses['causativeEventKnown'] !== undefined) || responses['chimericTranscript'] === 'No',
    regulatoryElements: responses['nearRegulatory'] === 'Yes' && (responses['proteinCoding'] !== undefined || responses['chimericTranscript'] === 'No'),
    submit: (responses['nearRegulatory'] !== undefined && responses['chimericTranscript'] === 'Yes') || (responses['chimericTranscript'] === 'No' && responses['nearRegulatory'] === 'Yes'),
    responseFields: responses['submitted'] === true,
  }), [responses]);

  // when visible updates, anything not visible is also removed from state
  useEffect(() => {
    Object.entries(visible).map(([key, value]) => {
      if (!value) {
        delete responses[key];
      }
    });
    setResponses(responses);
  }, [visible]);

  /**
   * Get ID for gene name. Updates geneIndex upon retrieval.
   * @param {string} symbol gene symbol to retrieve ID for
   */
  const getGeneID = (symbol) => {
    // eslint-disable-next-line consistent-return
    fetch(`/gene/${symbol}`).then((response) => response.json()).then((geneResponse) => {
      if (geneResponse.warnings) {
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
      .then((domainResponse) => {
        if (domainResponse.warnings) {
          return null;
        }
        const domainID = domainResponse.domain_id;
        const domainIndexCopy = domainIndex;
        domainIndexCopy[name] = domainID;
        setDomainIndex(domainIndexCopy);
      });
  };

  /*
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
      if (exonResponse.warnings) {
        return null;
      }
      const { chr, start, end } = exonResponse;
      const geneSymbol = exonResponse.gene;
      if (!gene) {
        const geneID = getGeneID(geneSymbol);
        console.log({ geneID });
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
        };
        setExonIndex(exonIndexCopy);
      }
    });
  };

  // perform ajax calls + update ID/coordinate indices
  useEffect(() => {
    const geneIndexCopy = geneIndex;
    const exonIndexCopy = exonIndex;
    components.forEach((component) => {
      const values = component.componentValues;

      if ('gene_symbol' in values) {
        const geneSymbol = values.gene_symbol;
        if (!(geneSymbol in geneIndexCopy)) {
          const geneID = getGeneID(geneSymbol);
          if (geneID != null) {
            geneIndexCopy[geneSymbol] = geneID;
          }
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

  return (
    <div className={classes.root}>
      <FormRadio
        name="chimericTranscript"
        prompt="Does the fusion create a chimeric transcript?"
        state={{
          options: ['Yes', 'No'],
          state: responses['chimericTranscript'],
          stateFunction: (oldValue, newValue) => handleResponse('chimericTranscript', newValue),
        }}
      />

      {visible['proteinCoding']
        ? (
          <FormRadio
            name="proteinCoding"
            prompt="Is at least one partner protein-coding?"
            state={{
              options: ['Yes', 'No', 'Unknown'],
              state: responses['proteinCoding'],
              stateFunction: (oldValue, newValue) => handleResponse('proteinCoding', newValue),
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
              state: responses['rfPreserved'],
              stateFunction: (oldValue, newValue) => { handleResponse('rfPreserved', newValue); },
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
              state: responses['causativeEventKnown'],
              stateFunction: (oldValue, newValue) => { handleResponse('causativeEventKnown', newValue); },
            }}
          />
        )
        : null}
      {visible['causativeEventForm']
        ? (
          <CausativeEventForm
            state={responses['causativeEvent']}
            handler={handleResponse.bind({}, 'causativeEvent')}
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
              state: responses['nearRegulatory'],
              stateFunction: (oldValue, newValue) => { handleResponse('nearRegulatory', newValue); },
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
      {visible['submit'] ? <SubmitButton handler={() => handleResponse('submitted', true)} /> : null}
      {visible['responseFields']
        ? (
          <ResponseField
            responseJSON={responseJSON}
            setResponseJSON={setResponseJSON}
            responseHuman={responseHuman}
            setResponseHuman={setResponseHuman}
            components={components}
            proteinCoding={responses['proteinCoding']}
            rfPreserved={responses['rfPreserved']}
            domains={domains}
            causativeEventKnown={responses['causativeEventKnown']}
            causativeEvent={responses['causativeEvent']}
            regulatoryElements={regulatoryElements}
            geneIndex={geneIndex}
            domainIndex={domainIndex}
            exonIndex={exonIndex}
          />
        )
        : null}
    </div>
  );
};

export default FormParent;
