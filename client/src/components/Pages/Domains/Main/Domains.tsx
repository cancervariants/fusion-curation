import React, { useContext } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";
import DomainForm from "../DomainForm/DomainForm";
import { ClientFunctionalDomain } from "../../../../services/ResponseModels";
import { GeneContext } from "../../../../global/contexts/GeneContext";
import { Avatar, Box, Chip, makeStyles, Typography } from "@material-ui/core";
import { HelpPopover } from "../../../main/shared/HelpPopover/HelpPopover";
import PopoverTypography from "../../../main/shared/HelpPopover/PopoverTypography";
import PopoverLink from "../../../main/shared/HelpPopover/PopoverLink";
import PopoverBox from "../../../main/shared/HelpPopover/PopoverBox";

interface Props {
  index: number;
}

export const Domain: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);

  const { globalGenes } = useContext(GeneContext);
  const domains = fusion.critical_functional_domains || [];

  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    container: {
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "stretch",
      flex: "1",
    },
    leftColumn: {
      width: "50%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorTheme["--light-gray"],
    },
    promptAndData: {
      width: "70%",
      margin: "20px 0 20px 0",
    },
    enterDataPrompt: {
      paddingLeft: "5px",
      marginBottom: "20px",
    },
    chipsList: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    domainChip: {
      margin: "4px",
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

  // TODO working stuff related to domain suggestions
  // Don't want to change the suggested domain based on user entries
  // should maybe create a separate context of the unmutated selected suggestion

  const handleRemove = (domain: ClientFunctionalDomain) => {
    let cloneArray: ClientFunctionalDomain[] = Array.from(
      fusion.critical_functional_domains
    );
    cloneArray = cloneArray.filter((obj) => {
      return obj["domain_id"] !== domain["domain_id"];
    });
    setFusion({
      ...fusion,
      ...{ critical_functional_domains: cloneArray || [] },
    });
  };

  const renderDomainChip = (domain: ClientFunctionalDomain, index: number) => {
    const MAX_DOMAIN_LABEL_LENGTH = 35;
    let domainLabelString: string;
    if (domain && domain.label) {
      if (domain.label.length > MAX_DOMAIN_LABEL_LENGTH) {
        domainLabelString = `${domain.label.slice(
          0,
          MAX_DOMAIN_LABEL_LENGTH
        )}...`;
      } else {
        domainLabelString = domain.label;
      }
    } else {
      // log error?
      domainLabelString = "unidentified domain";
    }
    return (
      <Chip
        key={index}
        className={classes.domainChip}
        clickable={false}
        avatar={<Avatar>{domain.status === "preserved" ? "P" : "L"}</Avatar>}
        label={
          <React.Fragment>
            {domainLabelString} <b>{`(${domain.associated_gene.label})`}</b>
          </React.Fragment>
        }
        onDelete={() => handleRemove(domain)}
      />
    );
  };

  const popover = (
    <HelpPopover>
      <PopoverBox>
        <PopoverTypography>
          Categorical Gene Fusions are often characterized by the presence or
          absence of critical functional domains within a gene fusion.
        </PopoverTypography>
        <PopoverTypography>
          Given a gene previously provided in a structural or regulatory
          element, select from its associated domains and indicate whether it
          was lost or preserved in the fusion.
        </PopoverTypography>
        <PopoverTypography>
          See the{" "}
          <PopoverLink href="https://fusions.cancervariants.org/en/latest/information_model.html#functional-domains">
            specification
          </PopoverLink>{" "}
          for more information.
        </PopoverTypography>
      </PopoverBox>
    </HelpPopover>
  );

  return (
    <Box className={classes.container}>
      <Box className={classes.leftColumn}>
        <Box className={classes.promptAndData}>
          {Object.keys(globalGenes).length > 0 ? (
            <Typography variant="h6" className={classes.enterDataPrompt}>
              You can add or remove domains.
              {popover}
            </Typography>
          ) : (
            <>
              <Typography variant="h6">No domains available.</Typography>
              <Typography>
                You must first provide gene-associated structure or regulatory
                elements to specify lost or preserved functional domains.
                {popover}
              </Typography>
            </>
          )}
          <Box>
            {domains.map((domain: ClientFunctionalDomain, index: number) =>
              renderDomainChip(domain, index)
            )}
          </Box>
        </Box>
      </Box>
      <Box className={classes.rightColumn}>
        <DomainForm />
      </Box>
    </Box>
  );
};
