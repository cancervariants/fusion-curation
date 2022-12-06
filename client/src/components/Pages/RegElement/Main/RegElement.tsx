import React, { useContext, useState } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { useColorTheme } from "../../../../global/contexts/Theme/ColorThemeContext";
import RegElementForm from "../RegElementForm/RegElementForm";
import {
  ClientRegulatoryElement,
  RegulatoryClass,
} from "../../../../services/ResponseModels";
import { Typography, makeStyles, Box, Link } from "@material-ui/core";
import { HelpPopover } from "../../../main/shared/HelpPopover/HelpPopover";

interface Props {
  index?: number;
}

export const RegElement: React.FC<Props> = () => {

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
    <Box>
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
    </Box>
  );
};
