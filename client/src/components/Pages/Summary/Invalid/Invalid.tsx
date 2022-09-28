import { Link, ListItem, Typography } from "@material-ui/core";
import List from "@mui/material/List";
import React from "react";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import "./Invalid.scss";

interface Props {
  validationErrors: string[];
}

export const Invalid: React.FC<Props> = ({ validationErrors }) => {
  const getElementNumberError = () => (
    <>
      <Typography>
        Insufficient number of structural and regulatory elements. From the{" "}
        <Link href="https://fusions.cancervariants.org/en/latest/information_model.html#structural-elements">
          Gene Fusion Specification
        </Link>
        :
      </Typography>
      <blockquote>
        "The structural elements of a gene fusion represent the expressed gene
        product, and are typically characterized at the gene level or the
        transcript level. Chimeric Transcript Fusions must be represented by at
        least two structural elements, and Regulatory Fusions must be
        represented by at least one structural element and one Regulatory
        Element."
      </blockquote>
    </>
  );

  /**
   * Render basic description of errors regarding missing assayed fusion properties
   * @returns Rendered component describing missing assayed fusion errors
   */
  const getAssayedArgsError = () => (
    <>
      <Typography>
        Required properties of this fusion are missing. Assayed Fusions are
        incomplete without both a specified causative event and details about
        the assay used to detect the fusion. See the relevant section of the{" "}
        <Link href="https://fusions.cancervariants.org/en/latest/information_model.html#assayed-elements">
          Gene Fusion Specification
        </Link>{" "}
        for details.
      </Typography>
    </>
  );

  /**
   * Render a basic representation of Pydantic validation errors
   * @param unparsedError raw error string (including newlines as splits)
   * @returns rendered error component
   */
  const getGenericValidationErrors = (unparsedError: string) => {
    console.log(unparsedError);
    console.log(unparsedError.split("\n"));
    const rawErrors = unparsedError
      .split("\n")
      .slice(1)
      .join("")
      .split(")")
      .filter(Boolean);
    return (
      <>
        <Typography>
          Some required object properties appear to be missing or
          incorrectly-formed -- look over the documentation for the{" "}
          <Link href="https://fusions.cancervariants.org/en/latest/information_model.html">
            Minimum Information Model
          </Link>{" "}
          for details.
        </Typography>
        <div className="errorContainer">
          {rawErrors.map((err, index) => (
            <>
              <code key={index}>{err}</code>
              <p />
            </>
          ))}
        </div>
      </>
    );
  };

  const hasGenericValidationErrors = (error: string) => {
    const pattern = /\d+ validation error(s)? for (Assayed|Categorical)Fusion/g;
    return error.match(pattern);
  };

  /**
   * Get a user-facing description given a server-delivered error message.
   * Our error emitting is pretty shaky right now -- it's probably impossible
   * to get more than one validation error at a time, and the Pydantic
   * validationError objects get flattened into strings. We'd probably have
   * to fix this at the top (UTA Tools, FUSOR) first, but this function
   * is a stopgap in the meantime.
   * @param error error message from server
   */
  const getErrorDescription = (error: string) => {
    if (
      error.includes(
        "Fusions must contain >= 2 structural elements, or >=1 structural element and a regulatory element"
      )
    ) {
      return getElementNumberError();
    } else if (error.includes("FUSOR.assayed_fusion() missing")) {
      return getAssayedArgsError();
    } else if (hasGenericValidationErrors(error)) {
      return getGenericValidationErrors(error);
    } else {
      return <Typography>{error}</Typography>;
    }
  };

  return (
    <div className="error-container">
      <Typography variant="h4">Hm... Something looks wrong.</Typography>
      <p />
      <Typography variant="h6">
        We encountered one or more validation errors while trying to construct
        this fusion. This is our best guess at what's going on:
      </Typography>
      <List>
        {validationErrors.map((error: string, index: number) => (
          <ListItem key={index}>
            <ListItemText>{getErrorDescription(error)}</ListItemText>
          </ListItem>
        ))}
      </List>
    </div>
  );
};
