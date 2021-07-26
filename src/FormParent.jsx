import { React, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FormRadio from './FormRadio';
import CausEventForm from './CausEventForm';
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

  // visibility handlers
  const [showProteinCoding, setShowProteinCoding] = useState(false);
  const [showNearRegulatory, setShowNearRegulatory] = useState(false);
  const [showRegulatoryElements, setShowRegulatoryElements] = useState(false);
  const [showInvalidFusion, setShowInvalidFusion] = useState(false);
  const [showRfPreserved, setShowRfPreserved] = useState(false);
  const [showDomains, setShowDomains] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [showCausEvent, setShowCausEvent] = useState(false);
  const [showCausEventInfo, setShowCausEventInfo] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // form value handlers
  const [chimericTranscript, setChimericTranscript] = useState('');
  const [nearRegulatory, setNearRegulatory] = useState('');
  const [regulatoryElements, setRegulatoryElements] = useState([]);
  const [proteinCoding, setProteinCoding] = useState('');
  const [rfPreserved, setRfPreserved] = useState('');
  const [domains, setDomains] = useState([]);
  // TODO need default value to make controlled/uncontrolled error go away?
  const [components, setComponents] = useState([]);
  const [causativeEventKnown, setCausativeEventKnown] = useState('');
  const [causativeEvent, setCausativeEvent] = useState('');
  const [responseJSON, setResponseJSON] = useState('{}');
  const [responseHuman, setResponseHuman] = useState('');

  // ajax values
  const [geneIndex, setGeneIndex] = useState({});
  const [domainIndex, setDomainIndex] = useState({});

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
      const conceptID = geneResponse.concept_id;
      const geneIndexCopy = geneIndex;
      geneIndexCopy[symbol] = conceptID;
      setGeneIndex(geneIndexCopy);
    });
  };

  /**
   * Get ID for functional domain. Updates domainIndex upon retrieval.
   * @param {string} name functional domain name to retrieve ID for
   */
  const getDomainID = (name) => {
    // eslint-disable-next-line consistent-return
    fetch(`/domain/${name}`).then((response) => response.json()).then((domainResponse) => {
      if (domainResponse.warnings) {
        return null;
      }
      const domainID = domainResponse.domain_id;
      const domainIndexCopy = domainIndex;
      domainIndexCopy[name] = domainID;
      setDomainIndex(domainIndexCopy);
    });
  };

  // Call asynchronous functions upon changes to state variables.
  useEffect(() => {
    const geneIndexCopy = geneIndex;
    components.forEach((component) => {
      // get gene IDs
      if ('gene_symbol' in component.componentValues) {
        const geneSymbol = component.componentValues.gene_symbol;
        if (!(geneSymbol in geneIndexCopy)) {
          const geneID = getGeneID(geneSymbol);
          if (geneID != null) {
            geneIndexCopy[geneSymbol] = geneID;
          }
        }
      }
    });
    setGeneIndex(geneIndexCopy);
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

  /**
   * Recursively hide children
   * @param {string} field name of field (should be the same as the state variable name) to hide
   */
  const hideChildren = (field) => {
    const dispatch = {
      chimericTranscript: 0,
      proteinCoding: 0,
      rfPreserved: 1,
      retainedDomains: 2,
      components: 3,
      causativeEventKnown: 4,
      causativeEvent: 5,
      nearRegulatory: 6,
      regulatoryElements: 7,
      invalidFusion: 8,
      submit: 9,
      response: 9,
    };

    const precedence = [
      setShowProteinCoding,
      setShowRfPreserved,
      setShowDomains,
      setShowComponents,
      setShowCausEvent,
      setShowCausEventInfo,
      setShowNearRegulatory,
      setShowRegulatoryElements,
      setShowInvalidFusion,
      setShowSubmit,
      setShowResponse,
    ];

    precedence.slice(dispatch[field]).forEach((f) => f(false));
  };

  /**
   * Handle result of "chimeric transcript" deicision. Make child elements visible or invisible.
   * @param {string} oldValue value of previous selection
   * @param {string} newValue newly selected value
   * @returns null, but updates state of child visibility elements accordingly
   */
  const handleSetChimericTranscript = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setChimericTranscript(newValue);
      if (newValue === 'Yes') {
        hideChildren('near-reg-element');
        setShowProteinCoding(true);
      } else if (newValue === 'No') {
        hideChildren('protein-coding');
        setShowNearRegulatory(true);
      } else {
        hideChildren('chimeric');
      }
    }
  };

  /**
   * Handle result of "protein coding" decision. Make child elements visible or invisible.
   * @param {string} oldValue value of previous selection
   * @param {string} newValue newly selected value
   * @returns nothing, but updates state of child elements accordingly
   */
  const handleSetProteinCoding = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setProteinCoding(newValue);
      if (newValue === 'Yes') {
        hideChildren('components');
        setShowRfPreserved(true);
      } else if (newValue === 'No' || newValue === 'Unknown') {
        hideChildren('rfPreserved');
        setShowComponents(true);
        setShowCausEvent(true);
      }
    }
  };

  /**
   * Handle result of "read frame preserved" decision. Make child elements visible or invisible.
   * @param {string} oldValue value of previous selection
   * @param {string} newValue newly selected value
   * @returns nothing, but updates state of child elements accordingly
   */
  const handleSetRfPreserved = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setRfPreserved(newValue);
      if (newValue === 'Yes') {
        hideChildren('components');
        setShowDomains(true);
        setShowComponents(true);
        setShowCausEvent(true);
      } else if (newValue === 'No') {
        hideChildren('retainedDomains');
        setShowComponents(true);
        setShowCausEvent(true);
      } else {
        hideChildren('retainedDomains');
        hideChildren('components');
      }
    }
  };

  /**
   * Handle result of "causative event known" decision. Make child elements visible or invisible.
   * @param {string} oldValue value of previous selection
   * @param {string} newValue newly selected value
   * @returns nothing, but updates state of child elements accordingly
   */
  const handleSetCausEvent = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setCausativeEventKnown(newValue);
      if (newValue === 'Yes') {
        hideChildren('nearRegulatory');
        setShowCausEventInfo(true);
        setShowNearRegulatory(true);
      } else if (newValue === 'No') {
        hideChildren('causativeEvent');
        setShowNearRegulatory(true);
      } else {
        hideChildren('causativeEvent');
      }
    }
  };

  /**
   * Handle result of "near regulatory element" decision. Make child elements visible or invisible.
   * @param {string} oldValue value of previous selection
   * @param {string} newValue newly selected value
   * @returns null, but updates state of child elements accordingly
   */
  const handleSetNearRegulatory = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setNearRegulatory(newValue);
      if (newValue === 'Yes') {
        hideChildren('invalidFusion');
        setShowRegulatoryElements(true);
        setShowSubmit(true);
      } else if (newValue === 'No') {
        hideChildren('regulatoryElements');
        if (showComponents) {
          setShowSubmit(true);
        } else {
          setShowInvalidFusion(true);
        }
      } else {
        hideChildren('regulatoryElements');
      }
    }
  };

  return (
    <div className={classes.root}>
      <Box pt={2}>
        <FormRadio
          name="chimeric-transcript"
          prompt="Does the fusion create a chimeric transcript?"
          state={{
            options: ['Yes', 'No'],
            state: chimericTranscript,
            stateFunction: handleSetChimericTranscript,
          }}
        />
      </Box>
      {showProteinCoding
        ? (
          <FormRadio
            name="protein-coding"
            prompt="Is at least one partner protein-coding?"
            state={{
              options: ['Yes', 'No', 'Unknown'],
              state: proteinCoding,
              stateFunction: handleSetProteinCoding,
            }}
          />
        )
        : null}
      {showRfPreserved
        ? (
          <FormRadio
            name="rf-preserved"
            prompt="Is the reading frame predicted to be preserved?"
            state={{
              options: ['Yes', 'No'],
              state: rfPreserved,
              stateFunction: handleSetRfPreserved,
            }}
          />
        )
        : null}
      {showDomains
        ? <DomainsForm domains={domains} setDomains={setDomains} />
        : null}
      {showComponents
        ? (
          <DndProvider backend={HTML5Backend}>
            <ComponentsForm components={components} setComponents={setComponents} />
          </DndProvider>
        )
        : null}
      {showCausEvent
        ? (
          <FormRadio
            name="causative-event"
            prompt="Is causative event known?"
            state={{
              options: ['Yes', 'No'],
              state: causativeEventKnown,
              stateFunction: handleSetCausEvent,
            }}
          />
        )
        : null}
      {showCausEventInfo
        ? (
          <CausEventForm
            state={causativeEvent}
            handler={setCausativeEvent}
          />
        )
        : null}
      {showNearRegulatory
        ? (
          <FormRadio
            name="regulatory-element-decision"
            prompt="Does fusion rearrange near regulatory element?"
            state={{
              options: ['Yes', 'No'],
              state: nearRegulatory,
              stateFunction: handleSetNearRegulatory,
            }}
          />
        )
        : null}
      {showRegulatoryElements
        ? (
          <RegulatoryElementsForm
            items={regulatoryElements}
            setItems={setRegulatoryElements}
          />
        )
        : null}
      {showInvalidFusion
        ? (
          <Box p={1}>
            <Typography>
              Not a valid fusion
            </Typography>
          </Box>
        )
        : null}
      {showSubmit ? <SubmitButton handler={() => setShowResponse(true)} /> : null}
      {showResponse
        ? (
          <ResponseField
            responseJSON={responseJSON}
            setResponseJSON={setResponseJSON}
            responseHuman={responseHuman}
            setResponseHuman={setResponseHuman}
            components={components}
            proteinCoding={proteinCoding}
            rfPreserved={rfPreserved}
            domains={domains}
            causativeEventKnown={causativeEventKnown}
            causativeEvent={causativeEvent}
            regulatoryElements={regulatoryElements}
            geneIndex={geneIndex}
            domainIndex={domainIndex}
          />
        )
        : null}
    </div>
  );
};

export default FormParent;
