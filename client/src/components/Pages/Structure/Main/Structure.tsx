import React, { useContext } from "react";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { HelpPopover } from "../../../main/shared/HelpPopover/HelpPopover";
import Builder from "../Builder/Builder";
import "./Structure.scss";
import PopoverBox from "../../../main/shared/HelpPopover/PopoverBox";
import PopoverTypography from "../../../main/shared/HelpPopover/PopoverTypography";
import PopoverLink from "../../../main/shared/HelpPopover/PopoverLink";

interface Props {
  index: number;
}

export const Structure: React.FC<Props> = () => {
  const fusion = useContext(FusionContext).fusion;

  const renderHelpContent = () => (
    <PopoverBox>
      <PopoverTypography>
        The structural elements of a gene fusion represent the expressed gene
        product, and are typically characterized at the gene level or the
        transcript level. Chimeric Transcript Fusions must be represented by at
        least two structural elements, and Regulatory Fusions must be
        represented by at least one structural element and one Regulatory
        Element.
      </PopoverTypography>
      <PopoverTypography>
        The order of structural elements is important, and by convention
        representations of structural components for gene fusions follow a
        5&#39; -&gt; 3&#39; ordering.
      </PopoverTypography>
      <PopoverTypography>
        See the{" "}
        <PopoverLink href="https://fusions.cancervariants.org/en/latest/information_model.html#structural-elements">
          specification
        </PopoverLink>{" "}
        for more information.
      </PopoverTypography>
    </PopoverBox>
  );

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
                {" "}
                Must provide at least 2 structural or regulatory elements.
              </span>
            )
          }
          <HelpPopover content={renderHelpContent} />
        </h5>
      </div>
      <Builder />
    </div>
  );
};
