import React, { useContext, useState } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";
import RegElementForm from "../RegElementForm/RegElementForm";
import {
  ClientRegulatoryElement,
  RegulatoryClass,
} from "../../../../services/ResponseModels";
import { Typography, makeStyles, Box } from "@material-ui/core";
import { HelpPopover } from "../../../main/shared/HelpPopover/HelpPopover";
import PopoverTypography from "../../../main/shared/HelpPopover/PopoverTypography";
import PopoverLink from "../../../main/shared/HelpPopover/PopoverLink";
import PopoverBox from "../../../main/shared/HelpPopover/PopoverBox";

interface Props {
  index: number;
}

export const RegElement: React.FC<Props> = () => {
  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    pageContainer: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      alignItems: "stretch",
    },
    pageTitle: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "space-around",
      height: "100px",
    },
    pageContent: {
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "stretch",
      flex: "1",
    },
    leftColumn: {
      width: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorTheme["--light-gray"],
    },
    descriptionContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "40px",
    },
    descriptionMain: {
      width: "70%",
    },
    descriptionSubText: {
      marginTop: "20px",
      width: "70%",
    },
    rightColumn: {
      display: "flex",
      flexDirection: "column",
      width: "50%",
      alignItems: "center",
      justifyContent: "center",
    },
  }));
  const classes = useStyles();

  const { fusion, setFusion } = useContext(FusionContext);
  const [regElement, setRegElement] = useState<
    ClientRegulatoryElement | undefined
  >(fusion.regulatory_element);

  const [elementClass, setElementClass] = useState<RegulatoryClass | "default">(
    regElement?.regulatory_class || "default"
  );
  const [gene, setGene] = useState<string>(
    regElement?.associated_gene?.label || ""
  );
  const [geneText, setGeneText] = useState<string>("");

  /**
   * Remove regulatory element submitted by user and wipe input fields.
   */
  const handleRemove = () => {
    delete fusion.regulatory_element;
    const cloneFusion = { ...fusion };
    setRegElement(undefined);
    setFusion(cloneFusion);
    setElementClass("default");
    setGene("");
    setGeneText("");
  };

  /**
   * Update state with newly-constructed or updated regulatory element object.
   * @param element regulatory element constructed from user input by server.
   */
  const handleUpdate = (element: ClientRegulatoryElement) => {
    setRegElement(element);
    setFusion({ ...fusion, ...{ regulatory_element: element } });
  };

  return (
    <div className={classes.pageContainer}>
      <Box className={classes.pageTitle}>
        <Typography variant="h4">Regulatory Element</Typography>
        <Typography>
          Define a regulatory element.{" "}
          <HelpPopover>
            <PopoverBox>
              <PopoverTypography>
                Regulatory elements include a Regulatory Feature used to
                describe an enhancer, promoter, or other regulatory elements
                that constitute Regulatory Fusions. Regulatory features may also
                be defined by a gene with which the feature is associated (e.g.
                an IGH-associated enhancer element).
              </PopoverTypography>
              <PopoverTypography>
                Our definitions of regulatory features follows the definitions
                provided by the{" "}
                <PopoverLink href="https://www.insdc.org/submitting-standards/controlled-vocabulary-regulatoryclass/">
                  INSDC regulatory class vocabulary
                </PopoverLink>
                . In gene fusions, these are typically either enhancer or
                promoter features.
              </PopoverTypography>
              <PopoverTypography>
                See the{" "}
                <PopoverLink href="https://fusions.cancervariants.org/en/latest/information_model.html#regulatory-elements">
                  specification
                </PopoverLink>{" "}
                for more information.
              </PopoverTypography>
            </PopoverBox>
          </HelpPopover>
        </Typography>
      </Box>
      <Box className={classes.pageContent}>
        <div className={classes.leftColumn}>
          <div className={classes.descriptionContainer}>
            <div className={classes.descriptionMain}>
              {regElement !== undefined ? (
                <>
                  <Typography variant="h5">
                    This fusion contains the <b>{regElement.display_class}</b>{" "}
                    regulatory element via the{" "}
                    {regElement.associated_gene &&
                      regElement.associated_gene.label &&
                      regElement.associated_gene.label.toUpperCase()}{" "}
                    gene.
                  </Typography>
                </>
              ) : (
                <Typography variant="h6">
                  No regulatory element specified.
                </Typography>
              )}
            </div>
            <div className={classes.descriptionSubText}>
              <Typography>
                {regElement !== undefined
                  ? "You can remove or update this regulatory element."
                  : "You can add a regulatory element."}
              </Typography>
            </div>
          </div>
        </div>
        <div className={classes.rightColumn}>
          <RegElementForm
            regElement={regElement}
            setRegElement={handleUpdate}
            removeRegElement={handleRemove}
            elementClass={elementClass}
            setElementClass={setElementClass}
            gene={gene}
            setGene={setGene}
            geneText={geneText}
            setGeneText={setGeneText}
          />
        </div>
      </Box>
    </div>
  );
};
