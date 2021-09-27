import React, { useContext, useRef} from 'react';
import Close from './Close';
import { FusionContext } from '../../../../global/contexts/FusionContext';

import './Domains.scss'
import DomainForm from '../DomainForm/DomainForm';

interface Props {
  index: number
}

export const Domain: React.FC<Props> = ( { index }) => {
  const {fusion, setFusion} = useContext(FusionContext);

  const domains = fusion.protein_domains || [];

  // Don't want to change the suggested domain based on user entries
  // should maybe create a separate context of the unmutated selected suggestion
  const initialDomains= useRef(domains) 

  const handleRemove = (domain) => {
    //copy domain array, then remove the domain with the relevant ID
    let cloneArray = Array.from(fusion.protein_domains);
    cloneArray = cloneArray.filter((obj) => {
      return obj["domain_id"] !== domain["domain_id"]
    })
    setFusion({ ...fusion, ...{ "protein_domains" : cloneArray || [] }})
  }

  return (
    <div className="domain-tab-container">
      <div className="left">
        <div className="blurb-container">
          {
            initialDomains.current.length > 0 ?
            <div className="blurb">
              The 
               {  
                initialDomains.current.map(domain => (
                  <span className="bold"> {domain.gene_descriptor.label} {domain.type}</span>
                ))  
                } protein functional domain appears to be affected. 
            </div>
            :
            <div className="blurb">
              No protein functional domains found.  
            </div>
          }
          <div className="sub-blurb">
          You can add or remove domains. 
          </div>
          
          {/* TODO: maybe create a two column list of lost vs preserved */}
          { domains.map(domain => (
            <div className="domain">
              <span>{domain.gene_descriptor.label} {domain.name} {domain.status}</span>
              <span className="close-button-domain" onClick={() => handleRemove(domain)}>
              <Close />
              </span>
            </div>
            ))  
            } 
            
            
        </div>

      </div>
      <div className="right">
      
      <DomainForm/>

      </div>

    </div>
  )

}