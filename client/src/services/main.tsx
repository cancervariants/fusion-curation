

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

export async function getSequenceId(chr) {
  let response = await fetch(`http://localhost:5000/lookup/sequence_id?input_sequence=GRCh38:${chr}`);
  let sequenceId = await response.json();
  return sequenceId;  

  // response model:
  // sequence: StrictStr
  //   sequence_id: StrictStr = ''
  //   warnings: List
}

export async function getExon(txAc, gene, startExon, endExon, startExonOffset, endExonOffset) {
  let reqObj = {
    tx_ac: txAc,
    gene: gene,
    exon_start: startExon,
    exon_start_offset: startExonOffset,
    exon_end: endExon,
    exon_end_offset: endExonOffset
  }

  let response = await fetch(`/lookup/coords`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqObj),
  });

  let exonResponse = await response.json();

  return exonResponse;

  // Response model
  // tx_ac: Optional[StrictStr]
  //   gene: Optional[StrictStr]
  //   gene_id: Optional[StrictStr]
  //   exon_start: Optional[StrictInt]
  //   exon_start_offset: Optional[StrictInt]
  //   exon_end: Optional[StrictInt]
  //   exon_end_offset: Optional[StrictInt]
  //   sequence_id: Optional[CURIE]
  //   chr: Optional[StrictStr]
  //   start: Optional[StrictInt]
  //   end: Optional[StrictInt]
  //   warnings: List
}

export async function validateFusion(fusion) {
  let response = await fetch(`http://localhost:5000/lookup/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fusion)
  });
  let fusionResponse = await response.json();
  return fusionResponse;

  //returns fusion, warnings
}