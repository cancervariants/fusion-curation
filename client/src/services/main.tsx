import {
  Fusion, FusionValidationResponse, NormalizeGeneResponse, AssociatedDomainResponse,
  SuggestGeneResponse, GeneComponentResponse, TxSegmentComponentResponse,
  TemplatedSequenceComponentResponse, GetTranscriptsResponse, ServiceInfoResponse,
  GetDomainResponse, DomainParams, DomainStatus, GeneComponent, TranscriptSegmentComponent,
  AnyGeneComponent, ClientAnyGeneComponent, ClientGeneComponent, ClientLinkerComponent,
  ClientTemplatedSequenceComponent, ClientTranscriptSegmentComponent, ClientUnknownGeneComponent,
  LinkerComponent, TemplatedSequenceComponent, UnknownGeneComponent, CoordsUtilsResponse
} from './ResponseModels';

export type ClientComponentUnion = ClientAnyGeneComponent | ClientGeneComponent |
  ClientLinkerComponent | ClientTemplatedSequenceComponent | ClientTranscriptSegmentComponent |
  ClientUnknownGeneComponent;

export type ComponentUnion = AnyGeneComponent | GeneComponent | LinkerComponent |
  UnknownGeneComponent | TemplatedSequenceComponent | TranscriptSegmentComponent;

export const getGeneComponent = async (term: string): Promise<GeneComponentResponse> => {
  const response = await fetch(`construct/component/gene?term=${term}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getTemplatedSequenceComponent = async (
  chr: string, strand: string, start: string, end: string
): Promise<TemplatedSequenceComponentResponse> => {
  const response = await fetch(
    `construct/component/templated_sequence?sequence_id=${chr}&start=${start}&end=${end}` +
    `&strand=${strand === '+' ? '%2B' : '-'}`
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentComponentECT = async (
  transcript: string, exonStart: string, exonEnd: string, exonStartOffset: string,
  exonEndOffset: string
): Promise<TxSegmentComponentResponse> => {
  const params: Array<string> = [`transcript=${transcript}`];
  // add optional params -- previous methods should've already checked that the request as a whole
  // is valid
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
  const url = 'component/tx_segment_ect?' + params.join('&');
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentComponentGCT = async (
  transcript: string, chromosome: string, start: string, end: string, strand: string
): Promise<TxSegmentComponentResponse> => {
  const params: Array<string> = [
    `transcript=${transcript}`, `chromosome=${chromosome}`,
    `strand=${strand === '+' ? '%2B' : '-'}`
  ];
  if (start !== '') params.push(`start=${start}`);
  if (end !== '') params.push(`end=${end}`);
  const url = 'construct/component/tx_segment_gct?' + params.join('&');
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentComponentGCG = async (
  gene: string, chromosome: string, start: string, end: string, strand: string
): Promise<TxSegmentComponentResponse> => {
  const params: Array<string> = [
    `gene=${gene}`, `chromosome=${chromosome}`, `strand=${strand === '+' ? '%2B' : '-'}`
  ];
  if (start !== '') params.push(`start=${start}`);
  if (end !== '') params.push(`end=${end}`);
  const url = 'construct/component/tx_segment_gcg?' + params.join('&');
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

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

export const getFunctionalDomain = async (
  domain: DomainParams, domainStatus: DomainStatus, geneId: string
): Promise<GetDomainResponse> => {
  const url = `/construct/domain?status=${domainStatus}&name=${domain.domain_name}` +
    `&domain_id=${domain.interpro_id}&gene_id=${geneId}` +
    `&sequence_id=${domain.refseq_ac}&start=${domain.start}&end=${domain.end}`;
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const validateFusion = async (fusion: Fusion): Promise<FusionValidationResponse> => {
  const response = await fetch('/validate', {
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

export const getTranscripts = async (term: string): Promise<GetTranscriptsResponse> => {
  const response = await fetch(`/utilities/get_transcripts?term=${term}`);
  const transcriptResponse = await response.json();
  return transcriptResponse;
};

export const getExonCoords = async (
  chromosome: string, start: string, end: string, strand: string, gene?: string, txAc?: string
): Promise<CoordsUtilsResponse> => {
  const argsArray = [
    `chromosome=${chromosome}`,
    `strand=${strand === '+' ? '%2B' : '-'}`,
    gene !== '' ? `gene=${gene}` : '',
    txAc !== '' ? `transcript=${txAc}` : '',
    start !== '' ? `start=${start}` : '',
    end !== '' ? `end=${end}` : '',
  ];
  const args = argsArray.filter(a => a !== '').join('&');
  const response = await fetch (`/utilities/get_exon?${args}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getGenomicCoords = async (
  gene: string, txAc: string, exonStart: string, exonEnd: string, exonStartOffset: string,
  exonEndOffset: string
): Promise<CoordsUtilsResponse> => {
  const argsArray = [
    gene !== '' ? `gene=${gene}` : '',
    txAc !== '' ? `transcript=${txAc}` : '',
    exonStart !== '' ? `exon_start=${exonStart}` : '',
    exonEnd !== '' ? `exon_end=${exonEnd}` : '',
    exonStartOffset !== '' ? `exon_start_offset=${exonStartOffset}` : '',
    exonEndOffset !== '' ? `exon_end_offset=${exonEndOffset}` : '',
  ];
  const args = argsArray.filter(a => a !== '').join('&');
  const response = await fetch (`/utilities/get_genomic?${args}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getInfo = async (): Promise<ServiceInfoResponse> => {
  const response = await fetch('/service_info');
  const responseJson = await response.json();
  return responseJson;
};
