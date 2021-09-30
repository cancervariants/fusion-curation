

export async function getGeneId(symbol) {
  let response = await fetch(`http://localhost:5000/lookup/gene?term=${symbol}`);
  let geneResponse = await response.json();
  return geneResponse;

  //returns term, concept_id, warnings
}

export async function getDomainId(domain) {
  let response = await fetch(`http://localhost:5000/lookup/domain?domain=${domain}`);
  let domainResponse = await response.json();
  return domainResponse;

  //returns domain, domain_id, warnings
}