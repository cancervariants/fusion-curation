/*
 * TODO
 * non-awful styling. My initial plan was to divide the page in half and make each side clickable.
 *
 * Additional behavior is needed to handle changes between types once a fusion is in-progress --
 * my sense is that we should try to preserve common elements (like a TranscriptSegmentElement) but
 * handleFusionTypeChange should drop all incompatible properties if a state change occurs
 * (ie if event.target.value !== fusionType). Maybe have a warning popup if that's about to happen.
 */
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { useContext, useState } from "react";
import { FusionContext } from "../../../global/contexts/FusionContext";
import "./FusionType.scss";

interface Props {
  index: number;
}

export const FusionType: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);
  const [fusionType, setFusionType] = useState(
    fusion.type ? fusion.type : null
  );

  const handleFusionTypeChange = (event) => {
    setFusionType(event.target.value);
    setFusion({ ...fusion, type: event.target.value });
  };

  return (
    <div className="fusion-type-container">
      <FormControl component="fieldset">
        <FormLabel component="legend">Select fusion type:</FormLabel>
        <RadioGroup
          aria-label="fusion_type"
          name="fusion_type"
          value={fusionType}
          onChange={handleFusionTypeChange}
        >
          <FormControlLabel
            value="AssayedFusion"
            control={<Radio />}
            label="AssayedFusion"
          />
          <FormControlLabel
            value="CategoricalFusion"
            control={<Radio />}
            label="CategoricalFusion"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
