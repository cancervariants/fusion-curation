import './Readable.scss'
import {useState } from 'react';

interface Props {
  // TODO: get types from model
  genes: any,
  proteinDomains: any,
  regulatoryElements: any,
  transcriptComponents: any
}

export const Readable: React.FC<Props> = ( { genes, proteinDomains, regulatoryElements, transcriptComponents }) => {



  return (
      <div className="readable-items-container">
      <div className="row-items">
      <div className="row">
        <div className="left-item">Genes </div>
        <div className="right-item">{genes.map((gene) => gene.toUpperCase())}</div>
      </div>
      <hr />
      <div className="row">
        <span className="left-item">Structure </span>
        <div className="right-item"> 
          {transcriptComponents.map(comp => <span className="right-sub-item">{comp}</span>)} 
        </div>
      </div>
      <hr />
      <div className="row">
        <span className="left-item">Regulatory Elements  </span>
        <span className="right-item">{regulatoryElements.map(re => `${re.gene_descriptor.label.toUpperCase()} ${re.type} `)}</span>
      </div>
      <hr />
      <div className="row">
        <span className="left-item">Protein Domains</span>
        <span className="right-item">{proteinDomains.map(pd => `${pd.status}: ${pd.name}`)} </span>
      </div>
      </div> 
      </div>
  )
}
