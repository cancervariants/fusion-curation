import React, { useContext } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";
import { HelpPopover } from "../../../main/shared/HelpPopover/HelpPopover";
import Builder from "../Builder/Builder";
import PopoverBox from "../../../main/shared/HelpPopover/PopoverBox";
import PopoverTypography from "../../../main/shared/HelpPopover/PopoverTypography";
import PopoverLink from "../../../main/shared/HelpPopover/PopoverLink";
import { Typography, makeStyles } from "@material-ui/core";

interface Props {
  index: number;
}

export const Structure: React.FC<Props> = () => {
  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    pageContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      height: "100%",
    },
    structureHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      flexDirection: "column",
      height: "100px",
    },
    errorText: {
      color: colorTheme["--error"],
    },
  }));
  const classes = useStyles();

  const fusion = useContext(FusionContext).fusion;

  return (
    <div className={classes.pageContainer}>
      <div className={classes.structureHeader}>
        <Typography variant="h4">Structure Overview</Typography>
        <Typography>
          Drag and rearrange elements.
          {
            // TODO -- how to interact w/ reg element count?
            fusion.structural_elements?.length +
              (fusion.regulatory_element !== undefined) >=
            2 ? null : (
              <span className={classes.errorText}>
                {" "}
                Must provide at least 2 structural or regulatory elements.
              </span>
            )
          }
          <HelpPopover>
            <PopoverBox>
              <PopoverTypography>
                The structural elements of a gene fusion represent the expressed
                gene product, and are typically characterized at the gene level
                or the transcript level. Chimeric Transcript Fusions must be
                represented by at least two structural elements, and Regulatory
                Fusions must be represented by at least one structural element
                and one Regulatory Element.
              </PopoverTypography>
              <PopoverTypography>
                The order of structural elements is important, and by convention
                representations of structural components for gene fusions follow
                a 5&#39; -&gt; 3&#39; ordering.
              </PopoverTypography>
              <PopoverTypography>
                See the{" "}
                <PopoverLink href="https://fusions.cancervariants.org/en/latest/information_model.html#structural-elements">
                  specification
                </PopoverLink>{" "}
                for more information.
              </PopoverTypography>
            </PopoverBox>
          </HelpPopover>
        </Typography>
      </div>
      <Builder />
    </div>
  );
};
