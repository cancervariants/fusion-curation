import {
  ExonCoordsRequest, ExonCoordsResponse, Fusion, FusionValidationResponse, NormalizeGeneResponse,
  SequenceIDResponse, AssociatedDomainResponse
} from './ResponseModels';

export async function getGeneId(symbol: string): Promise<NormalizeGeneResponse> {
  const response = await fetch(`/lookup/gene?term=${symbol}`);
  const geneResponse = await response.json();
  return geneResponse;
}

// TODO: remove?
export async function getDomainId(domain: string): Promise<Object> {
  const response = await fetch(`/lookup/domain?domain=${domain}`);
  const domainResponse = await response.json();
  return domainResponse;
}

export async function getAssociatedDomains(gene_id: string): Promise<AssociatedDomainResponse> {
  const response = await fetch(`/complete/domain?gene_id=${gene_id}`);
  const responseJson = await response.json();
  return responseJson;
}

export async function getSequenceId(chr: string): Promise<SequenceIDResponse> {
  const response = await fetch(`/lookup/sequence_id?input_sequence=GRCh38:${chr}`);
  const sequenceId = await response.json();
  return sequenceId;
}

export async function getExon(
  txAc: string, gene: string, startExon: number, endExon: number, startExonOffset: number,
  endExonOffset: number
): Promise<ExonCoordsResponse> {
  const reqObj: ExonCoordsRequest = {
    tx_ac: txAc,
    gene: gene,
    exon_start: startExon,
    exon_start_offset: startExonOffset,
    exon_end: endExon,
    exon_end_offset: endExonOffset
  };

  const response = await fetch('/lookup/coords', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqObj),
  });

  const exonResponse = await response.json();
  return exonResponse;
}

export async function validateFusion(fusion: Fusion): Promise<FusionValidationResponse> {
  const response = await fetch('/lookup/validate', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fusion)
  });
  const fusionResponse = await response.json();
  return fusionResponse;
}