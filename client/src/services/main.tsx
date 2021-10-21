import { ExonCoordsRequest, ExonCoordsResponse, FusionValidationResponse, NormalizeGeneResponse, SequenceIDResponse, SuggestDomainResponse } from './ResponseModels';

export async function getGeneId(symbol: string): Promise<NormalizeGeneResponse> {
  let response = await fetch(`/lookup/gene?term=${symbol}`);
  let geneResponse = await response.json();
  return geneResponse;
}

// TODO: remove?
export async function getDomainId(domain: string) {
  let response = await fetch(`/lookup/domain?domain=${domain}`);
  let domainResponse = await response.json();
  return domainResponse;
  //returns domain, domain_id, warnings
}

export async function getAssociatedDomains(gene_id: string): Promise<SuggestDomainResponse> {
  let response = await fetch(`/complete/domain?gene_id=${gene_id}`);
  let responseJson = await response.json();
  console.log(responseJson);
  return responseJson;
}

export async function getSequenceId(chr: string): Promise<SequenceIDResponse> {
  let response = await fetch(`/lookup/sequence_id?input_sequence=GRCh38:${chr}`);
  let sequenceId = await response.json();
  return sequenceId;
}

export async function getExon(txAc: string, gene: string, startExon: number, endExon: number, startExonOffset: number, endExonOffset: number): Promise<ExonCoordsResponse> {
  console.log(`txac ${txAc}, gene ${gene}, startExon ${startExon}, endExon ${endExon}, startExonOffset ${startExonOffset}, endExonOffset ${endExonOffset}`)
  let reqObj: ExonCoordsRequest = {
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
}

export async function validateFusion(fusion): Promise<FusionValidationResponse> {
  let response = await fetch(`/lookup/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fusion)
  });
  let fusionResponse = await response.json();
  return fusionResponse;
}