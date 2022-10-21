import React, { useContext } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import Builder from "../Builder/Builder";
import "./Structure.scss";

interface Props {
  index: number;
}

export const Structure: React.FC<Props> = () => {
  const fusion = useContext(FusionContext).fusion;

  return (
    <div className="structure-tab-container">
      <div className="structure-summary">
        <h3>Structure Overview</h3>
        <h5>
          Drag and rearrange elements.
          {
            // TODO -- how to interact w/ reg element count?
            fusion.structural_elements?.length +
              (fusion.regulatory_element !== undefined) >=
            2 ? null : (
              <span className="error-banner">
                Must provide at least 2 structural or regulatory elements.
              </span>
            )
          }
        </h5>
      </div>
      <Builder />
    </div>
  );
};
