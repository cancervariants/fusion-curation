/**
 * API request methods for interacting with server.
 */
import {
  NormalizeGeneResponse,
  AssociatedDomainResponse,
  SuggestGeneResponse,
  GeneElementResponse,
  TxSegmentElementResponse,
  TemplatedSequenceElementResponse,
  GetTranscriptsResponse,
  ServiceInfoResponse,
  GetDomainResponse,
  DomainParams,
  DomainStatus,
  GeneElement,
  TranscriptSegmentElement,
  MultiplePossibleGenesElement,
  ClientMultiplePossibleGenesElement,
  ClientGeneElement,
  ClientLinkerElement,
  ClientTemplatedSequenceElement,
  ClientTranscriptSegmentElement,
  ClientUnknownGeneElement,
  LinkerElement,
  TemplatedSequenceElement,
  UnknownGeneElement,
  CoordsUtilsResponse,
  SequenceIDResponse,
  ClientCategoricalFusion,
  ClientAssayedFusion,
  ValidateFusionResponse,
  AssayedFusion,
  CategoricalFusion,
  NomenclatureResponse,
  RegulatoryElement,
  RegulatoryClass,
  RegulatoryElementResponse,
  FunctionalDomain,
  ClientFunctionalDomain,
} from "./ResponseModels";

export type ClientElementUnion =
  | ClientMultiplePossibleGenesElement
  | ClientGeneElement
  | ClientLinkerElement
  | ClientTemplatedSequenceElement
  | ClientTranscriptSegmentElement
  | ClientUnknownGeneElement;

export type ElementUnion =
  | MultiplePossibleGenesElement
  | GeneElement
  | LinkerElement
  | UnknownGeneElement
  | TemplatedSequenceElement
  | TranscriptSegmentElement;

export type ClientFusion = ClientCategoricalFusion | ClientAssayedFusion;

/**
 * Check final validity of user-created fusion.
 * @param fusion in-progress fusion object to POST to server, which validates structure and
 * properties.
 * @returns response object with error messages, or completed Fusion. The server may fill in
 * some additional properties that are otherwise inferred, but we can also make serverside changes
 * to add additional annotations if we want to later.
 */
export const validateFusion = async (
  fusion: AssayedFusion | CategoricalFusion
): Promise<ValidateFusionResponse> => {
  const response = await fetch("/validate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fusion),
  });
  const fusionResponse = await response.json();
  return fusionResponse;
};

export const getGeneElement = async (
  term: string
): Promise<GeneElementResponse> => {
  const response = await fetch(
    `construct/structural_element/gene?term=${term}`
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getTemplatedSequenceElement = async (
  chr: string,
  strand: string,
  start: string,
  end: string
): Promise<TemplatedSequenceElementResponse> => {
  const response = await fetch(
    `construct/structural_element/templated_sequence?sequence_id=${chr}&start=${start}&end=${end}` +
      `&strand=${strand === "+" ? "%2B" : "-"}`
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentElementECT = async (
  transcript: string,
  exonStart: string,
  exonEnd: string,
  exonStartOffset: string,
  exonEndOffset: string
): Promise<TxSegmentElementResponse> => {
  const params: Array<string> = [`transcript=${transcript}`];
  // add optional params -- previous methods should've already checked that the request as a whole
  // is valid
  if (exonStart !== "") {
    params.push(`exon_start=${exonStart}`);
  }
  if (exonStartOffset !== "") {
    params.push(`exon_start_offset=${exonStartOffset}`);
  }
  if (exonEnd !== "") {
    params.push(`exon_end=${exonEnd}`);
  }
  if (exonEndOffset !== "") {
    params.push(`exon_end_offset=${exonEndOffset}`);
  }
  const url = "construct/structural_element/tx_segment_ect?" + params.join("&");
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentElementGCT = async (
  transcript: string,
  chromosome: string,
  start: string,
  end: string,
  strand: string
): Promise<TxSegmentElementResponse> => {
  const params: Array<string> = [
    `transcript=${transcript}`,
    `chromosome=${chromosome}`,
    `strand=${strand === "+" ? "%2B" : "-"}`,
  ];
  if (start !== "") params.push(`start=${start}`);
  if (end !== "") params.push(`end=${end}`);
  const url = "construct/structural_element/tx_segment_gct?" + params.join("&");
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const getTxSegmentElementGCG = async (
  gene: string,
  chromosome: string,
  start: string,
  end: string,
  strand: string
): Promise<TxSegmentElementResponse> => {
  const params: Array<string> = [
    `gene=${gene}`,
    `chromosome=${chromosome}`,
    `strand=${strand === "+" ? "%2B" : "-"}`,
  ];
  if (start !== "") params.push(`start=${start}`);
  if (end !== "") params.push(`end=${end}`);
  const url = "construct/structural_element/tx_segment_gcg?" + params.join("&");
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const getGeneId = async (
  symbol: string
): Promise<NormalizeGeneResponse> => {
  const response = await fetch(`lookup/gene?term=${symbol}`);
  const geneResponse = await response.json();
  return geneResponse;
};

export const getGeneSuggestions = async (
  term: string
): Promise<SuggestGeneResponse> => {
  const response = await fetch(`complete/gene?term=${term}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getAssociatedDomains = async (
  gene_id: string
): Promise<AssociatedDomainResponse> => {
  const response = await fetch(`/complete/domain?gene_id=${gene_id}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getFunctionalDomain = async (
  domain: DomainParams,
  domainStatus: DomainStatus,
  geneId: string
): Promise<GetDomainResponse> => {
  const url =
    `/construct/domain?status=${domainStatus}&name=${domain.domain_name}` +
    `&domain_id=${domain.interpro_id}&gene_id=${geneId}` +
    `&sequence_id=${domain.refseq_ac}&start=${domain.start}&end=${domain.end}`;
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
};

export const getTranscripts = async (
  term: string
): Promise<GetTranscriptsResponse> => {
  const response = await fetch(`/utilities/get_transcripts?term=${term}`);
  const transcriptResponse = await response.json();
  return transcriptResponse;
};

export const getExonCoords = async (
  chromosome: string,
  start: string,
  end: string,
  strand: string,
  gene?: string,
  txAc?: string
): Promise<CoordsUtilsResponse> => {
  const argsArray = [
    `chromosome=${chromosome}`,
    `strand=${strand === "+" ? "%2B" : "-"}`,
    gene !== "" ? `gene=${gene}` : "",
    txAc !== "" ? `transcript=${txAc}` : "",
    start !== "" ? `start=${start}` : "",
    end !== "" ? `end=${end}` : "",
  ];
  const args = argsArray.filter((a) => a !== "").join("&");
  const response = await fetch(`/utilities/get_exon?${args}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getGenomicCoords = async (
  gene: string,
  txAc: string,
  exonStart: string,
  exonEnd: string,
  exonStartOffset: string,
  exonEndOffset: string
): Promise<CoordsUtilsResponse> => {
  const argsArray = [
    gene !== "" ? `gene=${gene}` : "",
    txAc !== "" ? `transcript=${txAc}` : "",
    exonStart !== "" ? `exon_start=${exonStart}` : "",
    exonEnd !== "" ? `exon_end=${exonEnd}` : "",
    exonStartOffset !== "" ? `exon_start_offset=${exonStartOffset}` : "",
    exonEndOffset !== "" ? `exon_end_offset=${exonEndOffset}` : "",
  ];
  const args = argsArray.filter((a) => a !== "").join("&");
  const response = await fetch(`/utilities/get_genomic?${args}`);
  const responseJson = await response.json();
  return responseJson;
};

export const getSequenceIds = async (
  sequence: string
): Promise<SequenceIDResponse> => {
  const response = await fetch(
    `/utilities/get_sequence_id?sequence=${sequence}`
  );
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Fetch curation interface version info.
 * Currently only the backend service version gets printed to the user, but we provide
 * a bit more information in case we want to provide more in the future.
 * @returns object with version info for a couple of the server components, including
 * the server itself.
 */
export const getInfo = async (): Promise<ServiceInfoResponse> => {
  const response = await fetch("/service_info");
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Get nomenclature subcomponent for a given Regulatory Element
 * @param regulatoryElement
 * @returns nomenclature if successful
 */
export const getRegElementNomenclature = async (
  regulatoryElement: RegulatoryElement
): Promise<NomenclatureResponse> => {
  const response = await fetch("/nomenclature/regulatory_element", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(regulatoryElement),
  });
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Get nomenclature subcomponent for a given Transcript Segment Element
 * @param txSegment
 * @param first true if element is first in structure
 * @param last true if element is last in structure
 * @returns nomenclature if successful
 */
export const getTxSegmentNomenclature = async (
  txSegment: TranscriptSegmentElement,
  first: boolean,
  last: boolean
): Promise<NomenclatureResponse> => {
  const response = await fetch(
    `/nomenclature/transcript_segment?first=${first}&last=${last}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(txSegment),
    }
  );
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Get nomenclature subcomponent for a given Templated Sequence Element
 * @param templatedSequenceElement
 * @returns nomenclature if successful
 */
export const getTemplatedSequenceNomenclature = async (
  templatedSequenceElement: TemplatedSequenceElement
): Promise<NomenclatureResponse> => {
  const response = await fetch("/nomenclature/templated_sequence", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templatedSequenceElement),
  });
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Get nomenclature subcomponent for a given Gene Element
 * @param gene
 * @returns nomenclature if successful
 */
export const getGeneNomenclature = async (
  gene: GeneElement
): Promise<NomenclatureResponse> => {
  const response = await fetch("/nomenclature/gene", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gene),
  });
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Build complete RegulatoryElement
 * @param regulatoryClass value of regulatory element class (the generated Typescript type expects it to be lowercase, which is fine -- the server will upper-case it)
 * @param geneName user-provided gene referent (could theoretically be some sort of concept ID or xref, too)
 * @returns constructed Regulatory element or warnings
 */
export const getRegulatoryElement = async (
  regulatoryClass: RegulatoryClass,
  geneName: string
): Promise<RegulatoryElementResponse> => {
  const response = await fetch(
    `/construct/regulatory_element?element_class=${regulatoryClass}&gene_name=${geneName}`
  );
  const responseJson = await response.json();
  return responseJson;
};

type DemoFusionName =
  | "alk"
  | "ewsr1"
  | "bcr_abl1"
  | "tpm3_ntrk1"
  | "tpm3_pdgfrb"
  | "igh_myc";

export const assayedDemoList = [ {name: "EWSR1", endpoint: "ewsr1"}, {name: "TPM3-NTRK1", endpoint: "tpm3_ntrk1"}, {name: "TPM3-PDGFRB", endpoint: "tpm3_pdgfrb"} ]
export const categoricalDemoList = [{name: "ALK", endpoint: "alk"}, {name: "BCR-ABL1", endpoint: "bcr_abl1"}, {name: "IGH-MYC", endpoint: "igh_myc"}]

/**
 * Fetch an individual demo fusion object
 * @param fusionName name of demo fusion to fetch
 * @returns client-ready fusion object
 */
export const getDemoObject = async (
  fusionName: DemoFusionName
): Promise<ClientFusion> => {
  const response = await fetch(`/demo/${fusionName}`);
  const responseJson = await response.json();
  return responseJson.fusion;
};

type DemoData = {
  alk: ClientCategoricalFusion;
  ewsr1: ClientAssayedFusion;
  bcr_abl1: ClientCategoricalFusion;
  tpm3_ntrk1: ClientAssayedFusion;
  tpm3_pdgfrb: ClientAssayedFusion;
  igh_myc: ClientCategoricalFusion;
};

/**
 * Get all demo fusion object data
 * @returns object mapping fusion names to completed client-ready fusion objects
 */
export const getDemoObjects = async (): Promise<DemoData> => {
  const objectNames: DemoFusionName[] = [
    "alk",
    "ewsr1",
    "bcr_abl1",
    "tpm3_ntrk1",
    "tpm3_pdgfrb",
    "igh_myc",
  ];
  const demoData = Object.assign(
    {},
    ...objectNames.map((fusion) => ({ [fusion]: getDemoObject(fusion) }))
  );
  return demoData;
};
