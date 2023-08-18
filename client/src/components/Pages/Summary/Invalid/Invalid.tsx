import {
  Box,
  Divider,
  Link,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import List from "@mui/material/List";
import React, { useContext } from "react";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { ClientElementUnion } from "../../../../services/main";

interface Props {
  validationErrors: string[];
  setVisibleTab: CallableFunction;
}

export const Invalid: React.FC<Props> = ({
  validationErrors,
  setVisibleTab,
}) => {
  const { fusion } = useContext(FusionContext);
  const { colorTheme } = useColorTheme(); // ?
  const useStyles = makeStyles(() => ({
    pageBoundary: {
      padding: "20px",
      display: "flex",
      justifyContent: "center",
    },
    pageContainer: {
      display: "flex",
      flexDirection: "column",
      width: "80%",
    },
    pageHeader: {
      height: "150px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
    },
    pageContent: {},
    list: {
      backgroundColor: colorTheme["--light-gray"],
    },
  }));
  const classes = useStyles();

  const duplicateGeneError = (
    <ListItemText>
      A duplicated gene element was detected. Per the{" "}
      <Link
        href="https://fusions.cancervariants.org/en/latest/information_model.html#structural-elements"
        target="_blank"
        rel="noopener noreferrer"
      >
        Gene Fusion Specification
      </Link>
      , Internal Tandem Duplications are not considered gene fusions, as they do not involve an interaction
      between <b>two or more genes</b>.{" "}
      <Link href="#" onClick={() => setVisibleTab(0)}>
        Edit elements to resolve.
      </Link>
    </ListItemText>
  );

  const elementNumberError = (
    <ListItemText>
      Insufficient number of structural and regulatory elements. Per the{" "}
      <Link
        href="https://fusions.cancervariants.org/en/latest/information_model.html#structural-elements"
        target="_blank"
        rel="noopener noreferrer"
      >
        Gene Fusion Specification
      </Link>
      , you must either provide two or more Structural Elements (i.e. a Chimeric
      Transcript Fusion), or a Regulatory Element and at least one Structural
      Element (i.e. a Regulatory Fusion).{" "}
      <Link href="#" onClick={() => setVisibleTab(0)}>
        Add more elements to resolve.
      </Link>
    </ListItemText>
  );

  const noGeneElementsError = (
    <ListItemText>
      No specific gene or transcript element is provided. You must{" "}
      <Link href="#" onClick={() => setVisibleTab(0)}>
        add a Transcript Segment or a Gene element
      </Link>{" "}
      to the fusion's Structural Elements to resolve.
    </ListItemText>
  );

  const noEventError = (
    <ListItemText>
      The causative event is not specified.{" "}
      <Link href="#" onClick={() => setVisibleTab(2)}>
        Declare the event type
      </Link>{" "}
      to resolve.
    </ListItemText>
  );

  const noAssayError = (
    <ListItemText>
      No assay metadata is provided. You must{" "}
      <Link href="#" onClick={() => setVisibleTab(3)}>
        identify the assay, detection method, and methodology that was used to
        uncover the fusion
      </Link>{" "}
      in order to resolve.
    </ListItemText>
  );

  const assayIdCurieError = (
    <ListItemText>
      The provided assay ID is not a valid{" "}
      <Link
        href="https://www.w3.org/TR/2010/NOTE-curie-20101216/"
        target="_blank"
        rel="noopener noreferrer"
      >
        W3 CURIE
      </Link>
      .{" "}
      <Link href="#" onClick={() => setVisibleTab(3)}>
        Update the assay ID
      </Link>{" "}
      to resolve.
    </ListItemText>
  );

  const assayMethodUriCurieError = (
    <ListItemText>
      The provided assay method URI is not a valid{" "}
      <Link
        href="https://www.w3.org/TR/2010/NOTE-curie-20101216/"
        target="_blank"
        rel="noopener noreferrer"
      >
        W3 CURIE
      </Link>
      .{" "}
      <Link href="#" onClick={() => setVisibleTab(3)}>
        Update the method URI
      </Link>{" "}
      to resolve.
    </ListItemText>
  );

  const unknownError = (
    <>
      <ListItemText>
        We were unable to parse the validation failure for this fusion:
      </ListItemText>
      <blockquote>{validationErrors}</blockquote>
    </>
  );

  const CURIE_PATTERN = /^\w[^:]*:.+$/;
  console.log(fusion)

  const geneElements = fusion.structural_elements.filter(el => el.type === "GeneElement").map(el => { return el.nomenclature })
  const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)
  const duplicateGenes = findDuplicates(geneElements)

  const checkErrors = () => {
    const errorElements: React.ReactFragment[] = [];
    if (
      Boolean(fusion.regulatory_element) + fusion.structural_elements.length <
      2
    ) {
      errorElements.push(elementNumberError);
    } else {
      const containsGene = fusion.structural_elements.some(
        (e: ClientElementUnion) =>
          [
            "GeneElement",
            "TranscriptSegmentElement",
            "TemplatedSequenceElement",
          ].includes(e.type)
      );
      if (!containsGene && !fusion.regulatory_element) {
        errorElements.push(noGeneElementsError);
      }
    }
    if (duplicateGenes.length > 0) {
      errorElements.push(duplicateGeneError)
    }
    if (fusion.type == "AssayedFusion") {
      if (
        !(
          fusion.assay &&
          fusion.assay.assay_name &&
          fusion.assay.assay_id &&
          fusion.assay.method_uri
        )
      ) {
        errorElements.push(noAssayError);
      } else {
        if (!fusion.assay.assay_id.match(CURIE_PATTERN)) {
          errorElements.push(assayIdCurieError);
        }
        if (!fusion.assay.method_uri.match(CURIE_PATTERN)) {
          errorElements.push(assayMethodUriCurieError);
        }
      }
      if (!fusion.causative_event) {
        errorElements.push(noEventError);
      }
    }
    if (errorElements.length == 0) {
      errorElements.push(
        <>
          <blockquote>{unknownError}</blockquote>
        </>
      );
    }
    return errorElements;
  };

  return (
    <Box className={classes.pageBoundary}>
      <Box className={classes.pageContainer}>
        <Box className={classes.pageHeader}>
          <Typography variant="h4">Hm... Something looks wrong.</Typography>
          <Typography variant="h6">
            We encountered one or more validation errors while trying to
            construct this fusion:
          </Typography>
        </Box>
        <List component={Paper} className={classes.list}>
          {checkErrors().map((error, index: number) => (
            <>
              {index > 0 ? <Divider /> : <></>}
              <ListItem key={index}>{error}</ListItem>
            </>
          ))}
        </List>
      </Box>
    </Box>
  );
};
