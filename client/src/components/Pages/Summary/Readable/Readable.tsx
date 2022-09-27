import {
  ClientStructuralElement,
  NomenclatureResponse,
} from "../../../../services/ResponseModels";
import "./Readable.scss";
import React, { useContext, useEffect, useState } from "react";
import {
  ClientFusion,
  ElementType,
  ElementUnion,
  getGeneNomenclature,
  getRegElementNomenclature,
  getTemplatedSequenceNomenclature,
  getTxSegmentNomenclature,
} from "../../../../services/main";
import { FusionType } from "../Main/Summary";
import Chip from "@material-ui/core/Chip";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { Typography } from "@material-ui/core";

export const Readable: React.FC = () => {
  const { fusion } = useContext(FusionContext);
  // const [elements, setElements] = useState<ElementChipParts[]>([]);
  // const [nomenclature, setNomenclature] = useState<string>("");
  // const [structureNomenclature, setStructureNomencalture] =
  //   useState<string>("");
  // const [regulatoryElementNomenclature, setRegulatoryElementNomenclature] =
  //   useState<string>("");

  // useEffect(() => {
  //   createStructuralElementsNomenclature();
  // }, [fusion]);

  /**
   * Create nomenclature chips for structural elements
   */
  // const createStructuralElementsNomenclature = async () => {
  //   const promises = fusion.structural_elements.map(
  //     (el: ElementUnion, index: number) => {
  //       if (el.type === "TranscriptSegmentElement") {
  //         getTxSegmentNomenclature(
  //           el,
  //           index === 0,
  //           index === fusion.structural_elements.length - 1
  //         ).then((resp) => ({
  //           elementType: ElementType.transcriptSegmentElement,
  //           nomenclature: resp.nomenclature,
  //         }));
  //       } else if (el.type === "TemplatedSequenceElement") {
  //         getTemplatedSequenceNomenclature(el).then((resp) => ({
  //           elementType: ElementType.templatedSequenceElement,
  //           nomenclature: resp.nomenclature,
  //         }));
  //       } else if (el.type === "GeneElement") {
  //         getGeneNomenclature(el).then((resp) => ({
  //           elementType: ElementType.geneElement,
  //           nomenclature: resp.nomenclature,
  //         }));
  //       } else if (el.type === "LinkerSequenceElement") {
  //         return {nomenclature: el.linker_sequence.sequence, elementType: ElementType.linkerSequenceElement}
  //       } else if (el.type === "UnknownGeneElement") {
  //         return {nomenclature: "?", elementType: ElementType.unknownGeneElement}
  //       } else if (el.type === "MultiplePossibleGenesElement") {
  //         return {nomenclature: "v", elementType: ElementType.multiplePossibleGenesElement}
  //       } else {
  //         throw "Unrecognized element type";
  //       }
  //     }
  //   );
  //   const resolved = await Promise.all(promises);
  //   setStructuralElements(resolved);
  // };

  /**
   * Basic wrapper around the regulatory element nomenclature retrieval method
   */
  // const renderRegulatoryElementNomenclature = async () => {
  //   if (fusion.regulatory_element) {
  //     getRegElementNomenclature(fusion.regulatory_element).then(
  //       (response: NomenclatureResponse) => {
  //         if (!response.warnings) {
  //           return <Chip label={response.nomenclature} />;
  //         }
  //       }
  //     );
  //   }
  // };

  /**
   * Get updated nomenclature values
   */
  // useEffect(() => {
  //   const getStructureNomenclature = async () =>
  //     await generateStructureNomenclature(fusion);
  //   const getRegulatoryElementsNomenclature = async () =>
  //     await generateRegulatoryElementNomenclature(fusion);
  //   getStructureNomenclature();
  //   getRegulatoryElementsNomenclature();
  // }, []);

  return (
    <div className="readable-items-container">
      <div className="row-items">
        <div className="row">
          <span className="left-item">Structure </span>
          <div className="right-item">
            {fusion.structural_elements.map(
              (element: ClientStructuralElement, index: number) => (
                <Chip key={index} label={element.nomenclature} />
              )
            )}
          </div>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Regulatory Element</span>
          <span className="right-list-item">
            <div className="right-sub-list-item"></div>
          </span>
        </div>
        <hr />
        {fusion.type === "CategoricalFusion" && (
          <>
            <div className="row">
              <span className="left-item">Protein Domains</span>
              <span className="right-list-item">
                {fusion.critical_functional_domains &&
                  fusion.critical_functional_domains.length > 0 &&
                  fusion.critical_functional_domains.map((pd) => (
                    <div className="right-sub-list-item">
                      {`${pd.status}: ${pd.label}`}
                    </div>
                  ))}
              </span>
            </div>
            <hr />
            <div className="row">
              <span className="left-item">Reading Frame</span>
              <span className="right-item"></span>
              <span className="right-item">
                {fusion.r_frame_preserved === true
                  ? "Preserved"
                  : fusion.r_frame_preserved === false
                  ? "Not preserved"
                  : "Unspecified"}
              </span>
            </div>
          </>
        )}
        {fusion.type === "AssayedFusion" && (
          <>
            <div className="row">
              <span className="left-item">Causative Event</span>
              <span className="right-item">
                {fusion.causative_event.event_type || ""}
              </span>
            </div>
            <hr />
            <div className="row">
              <span className="left-item">Assay</span>
              <span className="right-item">{fusion.assay.assay_name}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
