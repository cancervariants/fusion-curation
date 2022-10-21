import React, { useContext, useState } from "react";
import Close from "../../Domains/Main/Close";
import { FusionContext } from "../../../../global/contexts/FusionContext";

import "./RegElement.scss";
import RegElementForm from "../RegElementForm/RegElementForm";
import {
  ClientRegulatoryElement,
  RegulatoryClass,
} from "../../../../services/ResponseModels";

interface Props {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RegElement: React.FC<Props> = ({ index }) => {
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
    const cloneFusion = { ...fusion };
    delete fusion.regulatory_element;
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
    <div className="reg-element-tab-container">
      <div className="left">
        <div className="blurb-container">
          <div className="blurb">
            {regElement !== undefined ? (
              <>
                This transcript structure appears to be associated with a
                <p />
                <span key={index} className="bold">
                  {regElement.associated_gene &&
                    regElement.associated_gene.label &&
                    regElement.associated_gene.label.toUpperCase()}{" "}
                  {regElement.display_class}
                  {"."}
                </span>
                <p />
              </>
            ) : (
              <>No regulatory element found.</>
            )}
          </div>
          <div className="sub-blurb">
            {regElement !== undefined
              ? "You can remove or replace this regulatory element."
              : "You can add a regulatory element."}
          </div>

          {regElement !== undefined ? (
            <div className="regel">
              <div>Remove</div>
              <div className="close-button-reg" onClick={() => handleRemove()}>
                <Close />
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="right">
        <RegElementForm
          regElement={regElement}
          setRegElement={handleUpdate}
          elementClass={elementClass}
          setElementClass={setElementClass}
          gene={gene}
          setGene={setGene}
          geneText={geneText}
          setGeneText={setGeneText}
        />
      </div>
    </div>
  );
};
