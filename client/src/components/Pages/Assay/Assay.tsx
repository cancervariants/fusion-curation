// TODO: enforce CURIE requirements in fields
import { FusionContext } from "../../../global/contexts/FusionContext";
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";
import { FormEvent, useContext, useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Assay as FusionAssay } from "../../../services/ResponseModels";
import React from "react";
import HelpTooltip from "../../main/shared/HelpTooltip/HelpTooltip";

interface Props {
  index: number;
}

export const Assay: React.FC<Props> = () => {
  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    assayTabContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "flex-start",
      height: "100%",
      backgroundColor: colorTheme["--light-gray"],
      flexWrap: "wrap",
    },
    column: {
      margin: "40px",
    },
    leftContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    rightContainer: {
      display: "flex",
      flexDirection: "column",
    },
    prompt: {
      paddingBottom: "5px",
    },
  }));
  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);

  // initialize assay object
  useEffect(() => {
    if (fusion.assay == undefined) {
      setFusion({ ...fusion, assay: {} });
    }
  }, []);

  // initialize field values
  const [fusionDetection, setFusionDetection] = useState(
    fusion?.assay?.fusionDetection !== undefined
      ? fusion?.assay?.fusionDetection
      : null
  );

  const [assayName, setAssayName] = useState(
    fusion?.assay?.assayName !== undefined ? fusion?.assay?.assayName : ""
  );

  const [assayId, setAssayId] = useState(
    fusion?.assay?.assayId !== undefined ? fusion?.assay?.assayId : ""
  );

  const [methodUri, setMethodUri] = useState(
    fusion?.assay?.methodUri !== undefined ? fusion?.assay?.methodUri : ""
  );

  const handleEvidenceChange = (event: FormEvent<HTMLInputElement>) => {
    const evidence_value = event.currentTarget.value;
    if (fusion?.assay?.fusionDetection !== evidence_value) {
      setFusionDetection(evidence_value);
      const assay = JSON.parse(JSON.stringify(fusion.assay));
      assay["fusionDetection"] = evidence_value;
      setFusion({ ...fusion, assay: assay });
    }
  };

  const propertySetterMap = {
    assayName: [setAssayName, "assayName"],
    assayId: [setAssayId, "assayId"],
    methodUri: [setMethodUri, "methodUri"],
  };

  // live update fields
  useEffect(() => {
    if (fusion?.assay?.fusionDetection !== fusionDetection) {
      setFusionDetection(fusion?.assay?.fusionDetection);
    }
    if (fusion?.assay?.assayName !== assayName) {
      setAssayName(fusion?.assay?.assayName);
    }
    if (fusion?.assay?.assayId !== assayId) {
      setAssayId(fusion?.assay?.assayId);
    }
    if (fusion?.assay?.methodUri !== methodUri) {
      setMethodUri(fusion?.assay?.methodUri);
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

  const evidenceText = "How was the fusion detected?";

  return (
    <Box className={classes.assayTabContainer}>
      <Box className={classes.leftContainer + " " + classes.column}>
        <Typography variant="h5" className={classes.prompt}>
          {evidenceText}
        </Typography>
        <FormControl component="fieldset">
          <HelpTooltip
            placement="bottom"
            title={
              <Typography>
                Direct detection methods (e.g. RNA-seq, RT-PCR) directly
                interrogate chimeric transcript junctions. Inferred detection
                methods (e.g. WGS, FISH) infer the existence of a fusion in the
                presence of compatible biomarkers (e.g. ALK rearrangements in
                non-small cell lung cancers).
              </Typography>
            }
          >
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
          </HelpTooltip>
        </FormControl>
      </Box>
      <Box className={classes.rightContainer + " " + classes.column}>
        <Typography variant="h5" className={classes.prompt}>
          Provide assay metadata:
        </Typography>
        <HelpTooltip
          placement="left"
          title={
            <Typography>
              A human-readable name for the assay. Should match the label for
              the assay ID, e.g. <i>fluorescence in-situ hybridization assay</i>{" "}
              for <Typography variant="overline">obi:OBI_0003094</Typography>.
            </Typography>
          }
        >
          <TextField
            label="Assay name"
            margin="dense"
            value={assayName}
            onChange={(event) =>
              handleValueChange("assayName", event.target.value)
            }
          />
        </HelpTooltip>
        <HelpTooltip
          placement="left"
          title={
            <Typography>
              An ID for the assay concept, e.g.{" "}
              <Typography variant="overline">obi:OBI_0003094</Typography> from
              the Ontology for Biomedical Investigations.
            </Typography>
          }
        >
          <TextField
            label="Assay ID"
            margin="dense"
            value={assayId}
            onChange={(event) =>
              handleValueChange("assayId", event.target.value)
            }
          />
        </HelpTooltip>
        <HelpTooltip
          placement="left"
          title={
            <Typography>
              A URI pointing to the methodological details of the assay.
            </Typography>
          }
        >
          <TextField
            label="Method URI"
            margin="dense"
            value={methodUri}
            onChange={(event) =>
              handleValueChange("methodUri", event.target.value)
            }
          />
        </HelpTooltip>
      </Box>
    </Box>
  );
};
