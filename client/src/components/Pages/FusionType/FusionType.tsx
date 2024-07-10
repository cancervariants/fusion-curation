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
import { useContext, useEffect, useState } from "react";
import { FusionContext } from "global/contexts/FusionContext";
import "./FusionType.scss";

interface Props {
  index: number;
}

export const FusionType: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);
  const [fusionType, setFusionType] = useState(
    fusion.type ? fusion.type : null
  );

  useEffect(() => {
    if (fusion.type !== fusionType) {
      setFusionType(fusion.type);
    }
  }, [fusion]);

  const handleFusionTypeChange = (event) => {
    const newType = event.target.value;
    if (newType !== fusionType) {
      setFusionType(newType);
      setFusion({ ...fusion, type: newType });
    }
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
            label="Assayed Fusion"
          />
          <FormControlLabel
            value="CategoricalFusion"
            control={<Radio />}
            label="Categorical Fusion"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
