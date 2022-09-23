import { NomenclatureResponse } from "../../../../services/ResponseModels";
import "./Readable.scss";
import React, { useEffect, useState } from "react";
import {
  ElementUnion,
  getGeneNomenclature,
  getRegElementNomenclature,
  getTemplatedSequenceNomenclature,
  getTxSegmentNomenclature,
} from "../../../../services/main";
import { FusionType } from "../Main/Summary";

interface Props {
  fusion: FusionType;
}

export const Readable: React.FC<Props> = ({ fusion }) => {
  const [structureNomenclature, setStructureNomencalture] =
    useState<string>("");
  const [regulatoryElementNomenclature, setRegulatoryElementNomenclature] =
    useState<string>("");

  /**
   * Create nomenclature for structural elements
   * @param fusion validated fusion object
   */
  async function generateStructureNomenclature(fusion: FusionType) {
    const promises = fusion.structural_elements.map(
      (el: ElementUnion, index: number) => {
        if (el.type === "TranscriptSegmentElement") {
          return getTxSegmentNomenclature(
            el,
            index === 0,
            index === fusion.structural_elements.length - 1
          ).then((resp) => resp.nomenclature);
        } else if (el.type === "TemplatedSequenceElement") {
          return getTemplatedSequenceNomenclature(el).then(
            (resp) => resp.nomenclature
          );
        } else if (el.type === "GeneElement") {
          return getGeneNomenclature(el).then((resp) => resp.nomenclature);
        } else if (el.type === "LinkerSequenceElement") {
          return el.linker_sequence.sequence;
        } else if (el.type === "UnknownGeneElement") {
          return "?";
        } else if (el.type === "MultiplePossibleGenesElement") {
          return "v";
        }
      }
    );
    const resolved = await Promise.all(promises);
    setStructureNomencalture(resolved.join("::"));
  }

  /**
   * Basic wrapper around the regulatory element nomenclature retrieval method
   * @param fusion validated fusion object
   */
  async function generateRegulatoryElementNomenclature(fusion: FusionType) {
    if (fusion.regulatory_element) {
      getRegElementNomenclature(fusion.regulatory_element).then(
        (response: NomenclatureResponse) => {
          if (!response.warnings) {
            setRegulatoryElementNomenclature(response.nomenclature as string);
          }
        }
      );
    }
  }

  /**
   * Get updated nomenclature values
   */
  useEffect(() => {
    const getStructureNomenclature = async () =>
      await generateStructureNomenclature(fusion);
    const getRegulatoryElementsNomenclature = async () =>
      await generateRegulatoryElementNomenclature(fusion);
    getStructureNomenclature();
    getRegulatoryElementsNomenclature();
  }, []);

  return (
    <div className="readable-items-container">
      <div className="row-items">
        <div className="row">
          <span className="left-item">Structure </span>
          <div className="right-item">
            <span className="right-sub-item" key={1}>
              {structureNomenclature}
            </span>
          </div>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Regulatory Element</span>
          <span className="right-list-item">
            <div className="right-sub-list-item">
              {regulatoryElementNomenclature}
            </div>
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
