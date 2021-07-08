import { React, useState } from 'react';
import FormRadio from './FormRadio';
import CausEventForm from './CausEventForm';
import FunctionalDomainsForm from './FunctionalDomainsForm';
import SubmitButton from './SubmitButton';
import ResponseField from './ResponseField';

const FormParent = () => {
  // visibility handlers
  const [showRfPreserved, setShowRfPreserved] = useState(false);
  const [showFuncDomains, setShowFuncDomains] = useState(false);
  const [showJunctions, setShowJunctions] = useState(false);
  const [showCausEvent, setShowCausEvent] = useState(false);
  const [showCausEventInfo, setShowCausEventInfo] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // form value handlers
  const [proteinCodingValue, setProteinCodingValue] = useState(null);
  const [rfPreserved, setRfPreserved] = useState(null);
  const [retainedDomains, setRetainedDomains] = useState(''); // TODO switch to array
  const [retainedDomainsGenes, setRetainedDomainGenes] = useState(''); // TODO switch to array
  const [junction5Prime, setJunction5Prime] = useState({});
  const [junction3Prime, setJunction3Prime] = useState({});
  const [causEvent, setCausEvent] = useState(null);
  const [responseJSON, setResponseJSON] = useState('');
  const [responseHuman, setResponseReadable] = useState('');

  const handleSetProteinCoding = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setProteinCodingValue(newValue);
      if (newValue === 'Yes') {
        setShowFuncDomains(false);
        setShowRfPreserved(true);
      } else if (newValue === 'No' || newValue === 'Unknown') {
        setShowRfPreserved(false);
        setShowFuncDomains(true);
        setShowCausEvent(true);
      }
    }
  };

  const handleSetRfPreserved = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setRfPreserved(newValue);
      if (newValue === 'Yes') {
        setShowFuncDomains(true);
        setShowJunctions(true);
        setShowCausEvent(true);
      } else if (newValue === 'No') {
        setShowFuncDomains(false);
        setShowJunctions(true);
        setShowCausEvent(true);
      }
    }
  };

  const handleSetCausEvent = (oldValue, newValue) => {
    if (oldValue !== newValue) {
      setCausEvent(newValue);
      if (newValue === 'Yes') {
        setShowCausEventInfo(true);
        setShowSubmit(true);
      } else if (newValue === 'No') {
        setShowCausEventInfo(false);
        setShowSubmit(true);
      } else {
        setShowCausEventInfo(false);
        setShowSubmit(false);
      }
    }
  };

  /**
   * 
   * @param {Object} outputJSON 
   * @return {string} 
   */
  const outputToReadable = (outputJSON) => {
    if (outputJSON.junctions) {
      const end5 = outputJSON.junctions['5_prime_end'];
      const end3 = outputJSON.junctions['3_prime_end'];
      if (end5 && end3) {
        if (end5.genomic_coordinate && end5.genomic_coordinate_position
          && end3.genomic_coordinate && end3.genomic_coordinate_position) {
          return null; // TODO "long form" coordinates
        }
        const end5String = `${end5.transcript}(${end5.gene.symbol}):exon${end5.exon_number}`;
        const end3String = `${end3.transcript}(${end3.gene.symbol}):exon${end3.exon_number}`;
        return `${end5String}::${end3String}`;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    const jsonOutput = {};
    if (proteinCodingValue === 'Yes') {
      if (rfPreserved === 'Yes') {
        jsonOutput.r_frame_preserved = true;
        if (retainedDomains !== '') {
          const domain = {
            domain_name: retainedDomains,
          };
          if (retainedDomainsGenes !== '') {
            domain.gene = retainedDomainsGenes;
          }
          jsonOutput.retainedDomains = [domain];
        }
      } else if (rfPreserved === 'No') {
        jsonOutput.r_frame_preserved = false;
      }
    }

    // TODO junctions:
    // * gene sub-object (get id)
    // * genomic_coordinate sub-object (chr, position)
    jsonOutput.junctions = {};
    if (Object.keys(junction5Prime).length > 0) {
      if ('gene' in junction5Prime) {
        // get normalized gene ID
        junction5Prime.gene = {
          symbol: junction5Prime.gene,
        };
      }
      jsonOutput.junctions['5_prime_end'] = junction5Prime;
    }
    if (Object.keys(junction3Prime).length > 0) {
      if ('gene' in junction3Prime) {
        // get normalized gene ID
        junction3Prime.gene = {
          symbol: junction3Prime.gene,
        };
      }
      jsonOutput.junctions['3_prime_end'] = junction3Prime;
    }
    if (Object.keys(jsonOutput.junctions).length === 0) {
      delete jsonOutput.junctions;
    }

    if (causEvent) {
      jsonOutput.causative_event = {
        event_type: causEvent,
      };
    }

    setResponseJSON(JSON.stringify(jsonOutput, null, 2));
    const humanReadable = outputToReadable(jsonOutput);
    if (humanReadable) setResponseReadable(humanReadable);
    setShowResponse(true);
  };

  return (
    <>
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
      {showFuncDomains
        ? (
          <FunctionalDomainsForm
            setRetainedDomains={setRetainedDomains}
            setRetainedDomainGenes={setRetainedDomainGenes}
          />
        )
        : null}
      {showJunctions
        ? (
          <JunctionsForm
            junction5Prime={junction5Prime}
            setJunction5Prime={setJunction5Prime}
            junction3Prime={junction3Prime}
            setJunction3Prime={setJunction3Prime}
          />
        )
        : null}
      {showCausEvent
        ? (
          <FormRadio
            name="causative-event"
            prompt="Is causative event known?"
            state={{
              options: ['Yes', 'No'],
              state: causEvent,
              stateFunction: handleSetCausEvent, // TODO
            }}
          />
        )
        : null}
      {showCausEventInfo ? <CausEventForm /> : null}
      {showSubmit ? <SubmitButton handler={handleSubmit} /> : null}
      {showResponse
        ? <ResponseField jsonValue={responseJSON} readableValue={responseHuman} />
        : null}
    </>
  );
};

export default FormParent;
