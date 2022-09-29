import React, { useContext, useState } from "react";
import { SuggestionContext } from "../../../../global/contexts/SuggestionContext";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import Grid from "@material-ui/core/Grid";

import "./StructureDiagram.scss";

export const StructureDiagram: React.FC = () => {
  const [suggestions] = useContext(SuggestionContext);
  const { setFusion } = useContext(FusionContext);

  const [active, setActive] = useState(-1);

  const selectStructure = (structure: string[], index: number) => {
    if (active === index) {
      // TODO: another good use of a "SelectedSuggestion" context that exists independently
      // of the fusion context
      // basically, which index of the SuggestionContext array has been selected?
      // this will let us keep the selection set to active when returning to this component
      // (currently it clears the active class)

      // clear selection
      setFusion({});
      setActive(-1);
      return;
    }
    // selecting a diagram populates the remainder of the user fusion object
    setFusion(suggestions[index]);

    // add CSS class to selected diagram
    setActive(index);
  };

  // TODO: logic here is dumb, non-return stuff should be moved out of return statement
  // and no need to do separate loops for components vs reg element genes
  return (
    <Grid container justify="center">
      {suggestions.map((suggestion, index) => {
        const structure = [];
        suggestion.structural_components.forEach((comp) => {
          structure.push(comp);
        });

        const regEls = [];
        suggestion.regulatory_elements.forEach((el) => {
          regEls.push(el.gene_descriptor.label);
        });

        return (
          <div
            className={`structure ${active === index ? "highlighted" : ""}`}
            onClick={() => selectStructure(structure, index)}
            key={index}
          >
            <div className="dimmer"></div>

            <div key={index} className="sub-structure">
              {structure.map((s, index) => (
                <span className={s.component_type} key={index}>
                  {s.shorthand}
                </span>
              ))}
            </div>

            <div className="regel-row">
              {regEls.map((el) => (
                <span className="regel-square" key={index}>
                  {el}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </Grid>
  );
};
