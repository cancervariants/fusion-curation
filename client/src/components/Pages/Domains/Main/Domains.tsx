import React, { useContext, useEffect, useRef } from "react";
import Close from "./Close";
import { FusionContext } from "../../../../global/contexts/FusionContext";

import "./Domains.scss";
import DomainForm from "../DomainForm/DomainForm";
import { ClientFunctionalDomain } from "../../../../services/ResponseModels";

interface Props {
  index: number;
}

export const Domain: React.FC<Props> = () => {
  const { fusion, setFusion } = useContext(FusionContext);

  const domains = fusion.functional_domains || [];

  // TODO working stuff related to domain suggestions
  // Don't want to change the suggested domain based on user entries
  // should maybe create a separate context of the unmutated selected suggestion

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const initialDomains = useRef(domains);

  const handleRemove = (domain) => {
    //copy domain array, then remove the domain with the relevant ID
    let cloneArray: ClientFunctionalDomain[] = Array.from(
      fusion.functional_domains
    );
    cloneArray = cloneArray.filter((obj) => {
      return obj["domain_id"] !== domain["domain_id"];
    });
    setFusion({ ...fusion, ...{ functional_domains: cloneArray || [] } });
  };

  return (
    <div className="domain-tab-container">
      <div className="left">
        <div className="blurb-container">
          <div className="sub-blurb">You can add or remove domains.</div>

          {/* TODO: maybe create a two column list of lost vs preserved */}
          {domains.map((domain: ClientFunctionalDomain, index: number) => (
            <div className="domain" key={index}>
              <span>
                {domain.associated_gene.label} {domain.label} {domain.status}
              </span>
              <span
                className="close-button-domain"
                onClick={() => handleRemove(domain)}
              >
                <Close />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="right">
        <DomainForm />
      </div>
    </div>
  );
};
