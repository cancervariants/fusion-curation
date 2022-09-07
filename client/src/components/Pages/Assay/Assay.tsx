// TODO: enforce CURIE requirements in fields
import "./Assay.scss";
import { FusionContext } from "../../../global/contexts/FusionContext";
import { FormEvent, useContext, useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import { Assay as FusionAssay } from "../../../services/ResponseModels";
import React from "react";

interface Props {
  index: number;
}

export const Assay: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);

  // initialize assay object
  useEffect(() => {
    if (fusion.assay == undefined) {
      setFusion({ ...fusion, assay: {} });
    }
  }, []);

  // initialize field values
  const [fusionDetection, setFusionDetection] = useState(
    fusion?.assay?.fusion_detection !== undefined
      ? fusion?.assay?.fusion_detection
      : null
  );

  const [assayName, setAssayName] = useState(
    fusion?.assay?.assay_name !== undefined ? fusion?.assay?.assay_name : ""
  );

  const [assayId, setAssayId] = useState(
    fusion?.assay?.assay_id !== undefined ? fusion?.assay?.assay_id : ""
  );

  const [methodUri, setMethodUri] = useState(
    fusion?.assay?.method_uri !== undefined ? fusion?.assay?.method_uri : ""
  );

  const handleEvidenceChange = (event: FormEvent<HTMLInputElement>) => {
    const evidence_value = event.currentTarget.value;
    if (fusion?.assay?.fusion_detection !== evidence_value) {
      setFusionDetection(evidence_value);
      const assay = JSON.parse(JSON.stringify(fusion.assay));
      assay["fusion_detection"] = evidence_value;
      setFusion({ ...fusion, assay: assay });
    }
  };

  const propertySetterMap = {
    assayName: [setAssayName, "assay_name"],
    assayId: [setAssayId, "assay_id"],
    methodUri: [setMethodUri, "method_uri"],
  };

  // live update fields
  useEffect(() => {
    if (fusion?.assay?.fusion_detection !== fusionDetection) {
      setFusionDetection(fusion?.assay?.fusion_detection);
    }
    if (fusion?.assay?.assay_name !== assayName) {
      setAssayName(fusion?.assay?.assay_name);
    }
    if (fusion?.assay?.assay_id !== assayId) {
      setAssayId(fusion?.assay?.assay_id);
    }
    if (fusion?.assay?.method_uri !== methodUri) {
      setMethodUri(fusion?.assay?.method_uri);
    }
  }, [fusion]);

  // TODO: not sure if this is the correct or necessary way to handle copying/assignments
  // good place for Colin to clean up
  const handleValueChange = (propertyName: string, value: string | null) => {
    const setterFunction: CallableFunction = propertySetterMap[propertyName][0];
    const jsonName: string = propertySetterMap[propertyName][1];
    const assay: FusionAssay = JSON.parse(JSON.stringify(fusion.assay));
    if (value !== assay[jsonName]) {
      setterFunction(value);
      assay[jsonName] = value;
      setFusion({ ...fusion, assay: assay });
    }
  };

  const evidenceText =
    "Was the fusion directly detected by the assay, or inferred?";

  return (
    <div className="assay-tab-container">
      <h3>{evidenceText}</h3>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label={evidenceText}
          name="controlled-radio-buttons-group"
          value={fusionDetection}
          onChange={handleEvidenceChange}
        >
          <FormControlLabel
            value="observed"
            control={<Radio />}
            label="Observed"
          />
          <FormControlLabel
            value="inferred"
            control={<Radio />}
            label="Inferred"
          />
        </RadioGroup>
      </FormControl>
      <TextField
        label="Assay name"
        margin="dense"
        value={assayName}
        onChange={(event) => handleValueChange("assayName", event.target.value)}
      />
      <TextField
        label="Assay ID"
        margin="dense"
        value={assayId}
        onChange={(event) => handleValueChange("assayId", event.target.value)}
      />
      <TextField
        label="Method URI"
        margin="dense"
        value={methodUri}
        onChange={(event) => handleValueChange("methodUri", event.target.value)}
      />
    </div>
  );
};
