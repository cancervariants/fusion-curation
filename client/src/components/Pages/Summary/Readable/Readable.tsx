import './Readable.scss';
import { useState } from 'react';

interface Props {
  // TODO: get types from model
  genes: any,
  proteinDomains: any,
  regulatoryElements: any,
  transcriptComponents: any,
  rFramePreserved: any,
  causativeEvent: any
}

export const Readable: React.FC<Props> = ({
  genes, proteinDomains, regulatoryElements, transcriptComponents, rFramePreserved, causativeEvent
}) => {



  return (
    <div className="readable-items-container">
      <div className="row-items">
        {/* <div className="row">
        <div className="left-item">Genes </div>
        <div className="right-item">{genes.map((gene) => gene.toUpperCase())}</div>
      </div>
      <hr /> */}
        <div className="row">
          <span className="left-item">Structure </span>
          <div className="right-item">
            {transcriptComponents.map((comp, index) =>
              // eslint-disable-next-line react/jsx-key
              <span className="right-sub-item">
                {`${index ? '::' : ''}${comp.hr_name}`}
              </span>)}
          </div>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Regulatory Elements  </span>
          <span className="right-item">
            {
              regulatoryElements.map(re =>
                // eslint-disable-next-line react/jsx-key
                <div className="right-sub-list-item">
                  {`${re.gene_descriptor.label.toUpperCase()} ${re.type}`}
                </div>
              )
            }
          </span>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Protein Domains</span>
          <span className="right-list-item">
            {proteinDomains.map(pd =>
              // eslint-disable-next-line react/jsx-key
              <div className="right-sub-list-item">{`${pd.status}: ${pd.name}`} </div>
            )}
          </span>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Reading Frame</span>
          <span className="right-item"></span>
          <span className="right-item">
            {`${rFramePreserved ? 'Preserved' : 'Not preserved'}`}
          </span>
        </div>
        <hr />
        <div className="row">
          <span className="left-item">Causative Event</span>
          <span className="right-item">{causativeEvent} </span>
        </div>
      </div>
    </div>
  );
};
