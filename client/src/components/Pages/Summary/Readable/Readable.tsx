import {
  CategoricalFusion,
  AssayedFusion,
  RegulatoryElement,
} from "../../../../services/ResponseModels";
import "./Readable.scss";
import React from "react";
import {
  ElementUnion,
  getGeneNomenclature,
  getRegElementNomenclature,
  getStructuralElementArrayNomenclature,
} from "../../../../services/main";

interface Props {
  fusion: AssayedFusion | CategoricalFusion;
}

export const Readable: React.FC<Props> = ({ fusion }) => {
  return (
    <div className="readable-items-container">
      <div className="row-items">
        <div className="row">
          <span className="left-item">Structure </span>
          <div className="right-item">"todo"</div>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Regulatory Elements </span>
          <span className="right-item">
            {fusion.regulatory_elements &&
              fusion.regulatory_elements.map((re: RegulatoryElement) => (
                <div className="right-sub-list-item">
                  {getRegElementNomenclature(re)}
                </div>
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
                      {`${pd.status}: ${pd.label}`}{" "}
                    </div>
                  ))}
              </span>
            </div>
            <hr />
            <div className="row">
              <span className="left-item">Reading Frame</span>
              <span className="right-item"></span>
              <span className="right-item">
                {fusion.r_frame_preserved &&
                  (fusion.r_frame_preserved === true
                    ? "Preserved"
                    : fusion.r_frame_preserved === false
                    ? "Not preserved"
                    : "")}
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
