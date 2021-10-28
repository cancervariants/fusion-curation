import {
  Fusion, FusionValidationResponse, NormalizeGeneResponse,
  AssociatedDomainResponse, SuggestGeneResponse, GeneComponentResponse,
  TxSegmentComponentResponse
} from './ResponseModels';

export const getGeneComponent = async (term: string): Promise<GeneComponentResponse> => {
  const response = await fetch(`component/gene?term=${term}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getTemplatedSequenceComponent = async (
  chr: string, strand: string, start: string, end: string
) => {
  const response = await fetch(
    `component/templated_sequence?sequence_id=${chr}&start=${start}&end=${end}` +
    `&strand=${strand === '+' ? '%2B' : '-'}`
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentComponent = async (
  transcript: string, gene: string, exonStart: string, exonEnd: string, exonStartOffset: string,
  exonEndOffset: string
): Promise<TxSegmentComponentResponse> => {
  const params: Array<string> = [`transcript=${transcript}`];
  // add optional params -- previous methods should've already checked that the request as a whole
  // is valid
  if (gene) {
    params.push(`gene=${gene}`);
  }
  if (exonStart !== '') {
    params.push(`exon_start=${exonStart}`);
  }
  if (exonStartOffset !== '') {
    params.push(`exon_start_offset=${exonStartOffset}`);
  }
  if (exonEnd !== '') {
    params.push(`exon_end=${exonEnd}`);
  }
  if (exonEndOffset !== '') {
    params.push(`exon_end_offset=${exonEndOffset}`);
  }
  const url = 'component/tx_segment_tx_to_g?' + params.join('&');
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

// TODO ~85% sure we can remove this
export const getGeneId = async (symbol: string): Promise<NormalizeGeneResponse> => {
  const response = await fetch(`/lookup/gene?term=${symbol}`);
  const geneResponse = await response.json();
  return geneResponse;
};

export const getGeneSuggestions = async (term: string): Promise<SuggestGeneResponse> => {
  const response = await fetch(`complete/gene?term=${term}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getAssociatedDomains = async (gene_id: string): Promise<AssociatedDomainResponse> => {
  const response = await fetch(`/complete/domain?gene_id=${gene_id}`);
  const responseJson = await response.json();
  return responseJson;
};

export const validateFusion = async (fusion: Fusion): Promise<FusionValidationResponse> => {
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
};
