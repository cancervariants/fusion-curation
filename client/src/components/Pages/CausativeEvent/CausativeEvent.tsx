import "./CausativeEvent.scss";
import { FusionContext } from "../../../global/contexts/FusionContext";
import React, { useContext, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@material-ui/core";
import { HelpPopover } from "../../main/shared/HelpPopover/HelpPopover";
import PopoverTypography from "../../main/shared/HelpPopover/PopoverTypography";
import PopoverLink from "../../main/shared/HelpPopover/PopoverLink";
import PopoverBox from "../../main/shared/HelpPopover/PopoverBox";
import HelpTooltip from "../../main/shared/HelpTooltip/HelpTooltip";
import TooltipTypography from "../../main/shared/HelpTooltip/TooltipTypography";

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
        <Box className="left column">
          <Typography variant="h5">
            What is the causative event?
            <HelpPopover>
              <PopoverBox>
                <PopoverTypography>
                  The evaluation of a fusion may be influenced by the underlying
                  mechanism that generated the fusion. Often this will be a DNA
                  rearrangement, but it could also be a read-through or
                  trans-splicing event.
                </PopoverTypography>
                <PopoverTypography>
                  See the{" "}
                  <PopoverLink href="https://fusions.cancervariants.org/en/latest/information_model.html#causative-event">
                    specification
                  </PopoverLink>{" "}
                  for more information.
                </PopoverTypography>
              </PopoverBox>
            </HelpPopover>
          </Typography>
          <HelpTooltip
            placement="bottom"
            title={
              <TooltipTypography>
                The type of event that generated the fusion.
              </TooltipTypography>
            }
          >
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
          </HelpTooltip>
        </Box>
      </FormControl>
      <Box className="right column">
        <HelpTooltip
          placement="bottom"
          title={
            <TooltipTypography>
              For rearrangements, this field is useful for characterizing the
              rearrangement. This could be a string describing the rearrangement
              with an appropriate nomenclature (e.g. ISCN or HGVS), or an
              equivalent data structure.
            </TooltipTypography>
          }
        >
          <TextField
            id="standard-multiline-static"
            multiline
            rows={6}
            label="Provide a free-text description"
            size="medium"
            value={eventDescription}
            onChange={handleDescriptionChange}
            variant="outlined"
            style={{ width: 300 }}
          />
        </HelpTooltip>
      </Box>
    </div>
  );
};
