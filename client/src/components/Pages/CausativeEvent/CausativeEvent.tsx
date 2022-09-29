import "./CausativeEvent.scss";
import { FusionContext } from "../../../global/contexts/FusionContext";
import React, { useContext, useState } from "react";
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

export const eventDisplayMap = {
  rearrangement: "Rearrangement",
  "trans-splicing": "Trans-splicing",
  "read-through": "Read-through",
};

export const CausativeEvent: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);

  const [eventType, setEventType] = useState<string>(
    fusion.causative_event?.event_type || ""
  );
  const [eventDescription, setEventDescription] = useState<string>(
    fusion.causative_event?.event_type || ""
  );

  /**
   * Ensure that causative event object exists for getter/setter purposes
   */
  const ensureEventInitialized = () => {
    if (!fusion.causative_event) {
      setFusion({ ...fusion, causative_event: {} });
    }
  };

  /**
   * Update form value and fusion causative event object upon event type change
   * @param htmlEvent form data input
   */
  const handleEventTypeChange = (
    htmlEvent: React.FormEvent<HTMLInputElement>
  ) => {
    const value = htmlEvent.currentTarget.value;
    if (value === eventType) return;
    ensureEventInitialized();
    if (eventType !== value) {
      setEventType(value);
    }
    const newCausativeEvent = { event_type: value, ...fusion.causative_event };
    setFusion({ causative_event: newCausativeEvent, ...fusion });
  };

  /**
   * Update description form value and causative event object with user-entered text
   * @param htmlEvent form data input
   */
  const handleDescriptionChange = (htmlEvent) => {
    const value = htmlEvent.currentTarget.value;
    if (value === eventDescription) return;
    ensureEventInitialized();
    if (eventDescription !== value) {
      setEventDescription(value);
    }
    const newCausativeEvent = {
      event_description: value,
      ...fusion.causative_event,
    };
    setFusion({ causative_event: newCausativeEvent, ...fusion });
  };

  return (
    <div className="event-tab-container">
      <FormControl component="fieldset">
        <h3>What is the causative event?</h3>
        <RadioGroup
          aria-label="Causative event?"
          name="controlled-radio-buttons-group"
          value={eventType}
          onChange={handleEventTypeChange}
        >
          {["rearrangement", "trans-splicing", "read-through"].map(
            (value, index) => (
              <FormControlLabel
                value={value}
                control={<Radio />}
                label={eventDisplayMap[value]}
                key={index}
              />
            )
          )}
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
        value={eventDescription}
        onChange={handleDescriptionChange}
      />
    </div>
  );
};
