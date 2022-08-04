import {
  CategoricalFusion,
  AssayedFusion,
  RegulatoryElement,
} from "../../../../services/ResponseModels";
import "./Readable.scss";
import React, { useEffect, useState } from "react";
import {
  getGeneNomenclature,
  getRegElementNomenclature,
  getTemplatedSequenceNomenclature,
  getTxSegmentNomenclature,
} from "../../../../services/main";

interface Props {
  fusion: AssayedFusion | CategoricalFusion;
}

export const Readable: React.FC<Props> = ({ fusion }) => {
  const [structureNomenclature, setStructureNomencalture] = useState("");
  const [regulatoryElementsNomenclature, setRegulatoryElementsNomenclature] =
    useState<any[]>([]);

  async function generateStructureNomenclature(fusion) {
    const promises = fusion.structural_elements.map((el, index) => {
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
      }
    });
    const resolved = await Promise.all(promises);
    setStructureNomencalture(resolved.join("::"));
  }

  async function generateRegulatoryElementsNomenclature(fusion) {
    const promises = fusion.regulatory_elements.map((el) => {
      return getRegElementNomenclature(el).then((resp) => resp.nomenclature);
    });
    const resolved = await Promise.all(promises);
    setRegulatoryElementsNomenclature(resolved);
  }

  useEffect(() => {
    const getStructureNomenclature = async () =>
      await generateStructureNomenclature(fusion);
    const getRegulatoryElementsNomenclature = async () =>
      await generateRegulatoryElementsNomenclature(fusion);
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
          <span className="left-item">Regulatory Elements </span>
          <span className="right-list-item">
            {regulatoryElementsNomenclature.map((rem) => (
              <div className="right-sub-list-item">{rem}</div>
            ))}
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
