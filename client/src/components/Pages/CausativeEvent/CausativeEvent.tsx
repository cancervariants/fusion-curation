// define w/ EventType
import "./CausativeEvent.scss";
import { FusionContext } from "../../../global/contexts/FusionContext";
import { useContext, useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";

interface Props {
  index: number;
}

export const CausativeEvent: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);

  // initialize event field
  useEffect(() => {
    if (fusion.causative_event == undefined) {
      setFusion({ ...fusion, causative_event: {} });
    }
  }, []);

  const [causativeEventType, setCausativeEventType] = useState(
    fusion.causative_event?.event_type !== undefined
      ? fusion.causative_event?.event_type
      : null
  );

  const [causativeEventDescription, setCausativeEventDescription] = useState(
    fusion.causative_event?.event_description !== undefined
      ? fusion.causative_event?.event_description
      : ""
  );

  // ensure live updates
  useEffect(() => {
    if (fusion.causative_event.event_type !== causativeEventType) {
      setCausativeEventType(fusion.causative_event.event_type);
    }
    if (
      fusion.causative_event.event_description !== causativeEventDescription
    ) {
      setCausativeEventDescription(fusion.causative_event.event_description);
    }
  }, [fusion]);

  const handleCauseChange = (event) => {
    const value = event.target.value;
    setCausativeEventType(value);
    const causativeEvent = {
      ...fusion.causative_event,
      event_type: event.target.value,
    };
    setFusion({ ...fusion, causative_event: causativeEvent });
  };

  const handleEnterDescription = (event) => {
    const value = event.target.value;
    setCausativeEventDescription(value);
    const causativeEvent = {
      ...fusion.causative_event,
      event_description: event.target.value,
    };
    setFusion({ ...fusion, causative_event: causativeEvent });
  };

  return (
    <div className="event-tab-container">
      <FormControl component="fieldset">
        <h3>What is the causative event?</h3>
        <RadioGroup
          aria-label="Causative event?"
          name="controlled-radio-buttons-group"
          value={causativeEventType}
          onChange={handleCauseChange}
        >
          <FormControlLabel
            value="rearrangement"
            control={<Radio />}
            label="Rearrangement"
          />
          <FormControlLabel
            value="trans-splicing"
            control={<Radio />}
            label="Trans-splicing"
          />
          <FormControlLabel
            value="read-through"
            control={<Radio />}
            label="Read-through"
          />
        </RadioGroup>
      </FormControl>
      <h3></h3>
      <TextField
        id="standard-multiline-static"
        multiline
        minRows={1}
        maxRows={4}
        label="Provide a free-text description"
        size="medium"
        value={causativeEventDescription}
        onChange={handleEnterDescription}
      />
    </div>
  );
};
