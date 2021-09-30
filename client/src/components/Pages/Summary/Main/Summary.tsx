import './Summary.scss'
import { FusionContext } from '../../../../global/contexts/FusionContext';
import React, { useContext, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';

interface Props {
  index: number
}



export const Summary: React.FC<Props> = ( { index }) => {


  const {fusion} = useContext(FusionContext);

  const genes = fusion.genes || [];
  const protein_domains = fusion.protein_domains || [];
  const regulatory_elements= fusion.regulatory_elements|| [];
  const transcript_components = fusion.transcript_components || [];

  return (
    <div className="summary-tab-container">
      <div className="summary-items-container">
      <div className="row-items">
      <div className="row">
        <div className="left-item">Gene </div>
        <div className="right-item">{genes.map(gene => `${gene}`)}</div>
      </div>
      <div className="row">
        <span className="left-item">Structure </span>
        <span className="right-item">{transcript_components.map(comp => comp.component_name)} </span>
      </div>
      <div className="row">
        <span className="left-item">Regulatory Elements  </span>
        <span className="right-item">{regulatory_elements.map(re => `${re.type} ${re.gene_descriptor.label}`)}</span>
      </div>
      <div className="row">
        <span className="left-item">Protein Domains</span>
        <span className="right-item">{protein_domains.map(pd => `${pd.status}: ${pd.gene_descriptor.label}`)} </span>
      </div>
      </div>
      

      <div className="save-button">
      <Button style={{width: '300px', marginTop: "30px"}} variant="contained" color="primary">Save</Button>
      </div>
      </div>
    </div>
  )
}
