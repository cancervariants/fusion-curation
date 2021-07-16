import { React, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { makeStyles } from '@material-ui/core/styles';
import FormRadio from './FormRadio';
import CausEventForm from './CausEventForm';
import DomainsForm from './DomainsForm';
import SubmitButton from './SubmitButton';
import ResponseField from './ResponseField';
import ComponentsForm from './ComponentsForm';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const FormParent = () => {
  const classes = useStyles();

  // visibility handlers
  const [showRfPreserved, setShowRfPreserved] = useState(false);
  const [showDomains, setShowDomains] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [showCausEvent, setShowCausEvent] = useState(false);
  const [showCausEventInfo, setShowCausEventInfo] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // form value handlers
  const [proteinCodingValue, setProteinCodingValue] = useState('');
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
    const geneIndexCopy = geneIndex;
    domains.forEach((domain) => {
      if (domain.gene && !(domain.gene in geneIndexCopy)) {
        const geneID = getGeneID(domain.gene);
        if (geneID != null) {
          geneIndexCopy[domain.gene] = geneID;
        }
      }
    });
    setGeneIndex(geneIndexCopy);
  }, [domains]);

  /**
   * Recursively hide children
   * @param {string} field name of field (should be the same as the state variable name)
   */
  const hideChildren = (field) => {
    const dispatch = {
      rfPreserved: 0,
      retainedDomains: 1,
      components: 2,
      causativeEventKnown: 3,
      causativeEvent: 4,
      submit: 4,
      response: 6,
    };

    const precedence = [
      setShowRfPreserved,
      setShowDomains,
      setShowComponents,
      setShowCausEvent,
      setShowCausEventInfo,
      setShowSubmit,
      setShowResponse,
    ];

    precedence.slice(dispatch[field]).forEach((f) => f(false));
  };

  /**
   * Handle result of "protein coding" decision. Make child elements visible or invisible.
   * @param {string} oldValue value of previous selection
   * @param {string} newValue newly selected value
   * @returns nothing, but updates state of child elements accordingly
   */
  const handleSetProteinCoding = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setProteinCodingValue(newValue);
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
        setShowCausEventInfo(true);
        setShowSubmit(true);
      } else if (newValue === 'No') {
        hideChildren('causativeEvent');
        setShowSubmit(true);
      } else {
        hideChildren('causativeEvent');
      }
    }
  };

  return (
    <div className={classes.root}>
      <FormRadio
        name="protein-coding"
        prompt="Is at least one partner protein-coding?"
        state={{
          options: ['Yes', 'No', 'Unknown'],
          state: proteinCodingValue,
          stateFunction: handleSetProteinCoding,
        }}
      />
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
      {showSubmit ? <SubmitButton handler={() => setShowResponse(true)} /> : null}
      {showResponse
        ? (
          <ResponseField
            responseJSON={responseJSON}
            setResponseJSON={setResponseJSON}
            responseHuman={responseHuman}
            setResponseHuman={setResponseHuman}
            components={components}
            proteinCoding={proteinCodingValue}
            rfPreserved={rfPreserved}
            domains={domains}
            causativeEventKnown={causativeEventKnown}
            causativeEvent={causativeEvent}
            geneIndex={geneIndex}
          />
        )
        : null}
    </div>
  );
};

export default FormParent;
