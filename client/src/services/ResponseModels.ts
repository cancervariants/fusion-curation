/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

/**
 * Define possible classes of Regulatory Elements. Options are the possible values
 * for /regulatory_class value property in the INSDC controlled vocabulary:
 * https://www.insdc.org/controlled-vocabulary-regulatoryclass
 */
export type RegulatoryClass =
  | "attenuator"
  | "caat_signal"
  | "enhancer"
  | "enhancer_blocking_element"
  | "gc_signal"
  | "imprinting_control_region"
  | "insulator"
  | "locus_control_region"
  | "minus_35_signal"
  | "minus_10_signal"
  | "polya_signal_sequence"
  | "promoter"
  | "response_element"
  | "ribosome_binding_site"
  | "riboswitch"
  | "silencer"
  | "tata_box"
  | "terminator"
  | "other";
/**
 * A `W3C Compact URI <https://www.w3.org/TR/curie/>`_ formatted string. A CURIE string has the structure ``prefix``:``reference``, as defined by the W3C syntax.
 */
export type CURIE = string;
/**
 * A range comparator.
 */
export type Comparator = "<=" | ">=";
/**
 * A character string representing cytobands derived from the *International System for Human Cytogenomic Nomenclature* (ISCN) `guidelines <http://doi.org/10.1159/isbn.978-3-318-06861-0>`_.
 */
export type HumanCytoband = string;
/**
 * Define possible values for strand
 */
export type Strand = "+" | "-";
/**
 * A character string of Residues that represents a biological sequence using the conventional sequence order (5'-to-3' for nucleic acid sequences, and amino-to-carboxyl for amino acid sequences). IUPAC ambiguity codes are permitted in Sequences.
 */
export type Sequence = string;
/**
 * Permissible values for describing the underlying causative event driving an
 * assayed fusion.
 */
export type EventType = "rearrangement" | "read-through" | "trans-splicing";
/**
 * Form of evidence supporting identification of the fusion.
 */
export type Evidence = "observed" | "inferred";
/**
 * Define possible statuses of functional domains.
 */
export type DomainStatus = "lost" | "preserved";

/**
 * Assayed gene fusions from biological specimens are directly detected using
 * RNA-based gene fusion assays, or alternatively may be inferred from genomic
 * rearrangements detected by whole genome sequencing or by coarser-scale cytogenomic
 * assays. Example: an EWSR1 fusion inferred from a breakapart FISH assay.
 */
export interface AssayedFusion {
  type?: "AssayedFusion";
  regulatory_element?: RegulatoryElement;
  structural_elements: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | UnknownGeneElement
  )[];
  causative_event: CausativeEvent;
  assay: Assay;
}
/**
 * Define RegulatoryElement class.
 *
 * `feature_id` would ideally be constrained as a CURIE, but Encode, our preferred
 * feature ID source, doesn't currently have a registered CURIE structure for EH_
 * identifiers. Consequently, we permit any kind of free text.
 */
export interface RegulatoryElement {
  type?: "RegulatoryElement";
  regulatory_class: RegulatoryClass;
  feature_id?: string;
  associated_gene?: Gene;
  feature_location?: SequenceLocation;
}
/**
 * The Extension class provides VODs with a means to extend descriptions
 * with other attributes unique to a content provider. These extensions are
 * not expected to be natively understood under VRS, but may be used
 * for pre-negotiated exchange of message attributes when needed.
 */
export interface Extension {
  type?: "Extension";
  name: string;
  value?: unknown;
}
/**
 * A reference to a Gene as defined by an authority. For human genes, the use of
 * `hgnc <https://registry.identifiers.org/registry/hgnc>`_ as the gene authority is
 * RECOMMENDED.
 */
export interface Gene {
  type?: "Gene";
  id: string;
  label: string;
}
/**
 * A referenced Sequence
 */
export interface SequenceReference {
  // refseq id of the referenced sequence
  id?: CURIE;
  type?: "SequenceReference";
  // VRS computed identifier for the sequence accession
  refgetAccession: string;
}
/**
 * A Location defined by the start/end coordinates on a referenced Sequence.
 */
export interface SequenceLocation {
  /**
   * A VRS Computed Identifier for the Sequence location.
   */
  id?: CURIE;
  type?: "SequenceLocation";
  sequenceReference: SequenceReference;
  // start coordinate of the sequence location
  start: number;
  // end coordinate of the sequence location
  end: number;
}
/**
 * A bounded, inclusive range of numbers.
 */
export interface DefiniteRange {
  type?: "DefiniteRange";
  /**
   * The minimum value; inclusive
   */
  min: number;
  /**
   * The maximum value; inclusive
   */
  max: number;
}
/**
 * A half-bounded range of numbers represented as a number bound and associated
 * comparator. The bound operator is interpreted as follows: '>=' are all numbers
 * greater than and including `value`, '<=' are all numbers less than and including
 * `value`.
 */
export interface IndefiniteRange {
  type?: "IndefiniteRange";
  /**
   * The bounded value; inclusive
   */
  value: number;
  /**
   * MUST be one of '<=' or '>=', indicating which direction the range is indefinite
   */
  comparator: Comparator;
}
/**
 * A simple integer value as a VRS class.
 */
export interface Number {
  type?: "Number";
  /**
   * The value represented by Number
   */
  value: number;
}
/**
 * A Location on a chromosome defined by a species and chromosome name.
 */
export interface ChromosomeLocation {
  /**
   * Location Id. MUST be unique within document.
   */
  _id?: CURIE;
  type?: "ChromosomeLocation";
  /**
   * CURIE representing a species from the `NCBI species taxonomy <https://registry.identifiers.org/registry/taxonomy>`_. Default: 'taxonomy:9606' (human)
   */
  species_id?: CURIE & string;
  /**
   * The symbolic chromosome name. For humans, For humans, chromosome names MUST be one of 1..22, X, Y (case-sensitive)
   */
  chr: string;
  /**
   * The chromosome region defined by a CytobandInterval
   */
  interval: CytobandInterval;
}
/**
 * A contiguous span on a chromosome defined by cytoband features. The span includes
 * the constituent regions described by the start and end cytobands, as well as any
 * intervening regions.
 */
export interface CytobandInterval {
  type?: "CytobandInterval";
  /**
   * The start cytoband region. MUST specify a region nearer the terminal end (telomere) of the chromosome p-arm than `end`.
   */
  start: HumanCytoband;
  /**
   * The end cytoband region. MUST specify a region nearer the terminal end (telomere) of the chromosome q-arm than `start`.
   */
  end: HumanCytoband;
}
/**
 * Define TranscriptSegment class
 */
export interface TranscriptSegmentElement {
  type?: "TranscriptSegmentElement";
  transcript: CURIE;
  exon_start?: number;
  exon_start_offset?: number;
  exon_end?: number;
  exon_end_offset?: number;
  gene: Gene;
  element_genomic_start?: SequenceLocation;
  element_genomic_end?: SequenceLocation;
}
/**
 * Define Gene Element class.
 */
export interface GeneElement {
  type?: "GeneElement";
  gene: Gene;
}
/**
 * Define Templated Sequence Element class.
 * A templated sequence is a contiguous genomic sequence found in the gene
 * product.
 */
export interface TemplatedSequenceElement {
  type?: "TemplatedSequenceElement";
  region: SequenceLocation;
  strand: Strand;
}
/**
 * Define Linker class (linker sequence)
 */
export interface LinkerElement {
  type?: "LinkerSequenceElement";
  linker_sequence: SequenceDescriptor;
}
/**
 * Define UnknownGene class. This is primarily intended to represent a
 * partner in the result of a fusion partner-agnostic assay, which identifies
 * the absence of an expected gene. For example, a FISH break-apart probe may
 * indicate rearrangement of an MLL gene, but by design, the test cannot
 * provide the identity of the new partner. In this case, we would associate
 * any clinical observations from this patient with the fusion of MLL with
 * an UnknownGene element.
 */
export interface UnknownGeneElement {
  type?: "UnknownGeneElement";
}
/**
 * The evaluation of a fusion may be influenced by the underlying mechanism that
 * generated the fusion. Often this will be a DNA rearrangement, but it could also be
 * a read-through or trans-splicing event.
 */
export interface CausativeEvent {
  type?: "CausativeEvent";
  event_type: EventType;
  event_description?: string;
}
/**
 * Information pertaining to the assay used in identifying the fusion.
 */
export interface Assay {
  type?: "Assay";
  assay_name: string;
  assay_id: CURIE;
  method_uri: CURIE;
  fusion_detection: Evidence;
}
/**
 * Response model for domain ID autocomplete suggestion endpoint.
 */
export interface AssociatedDomainResponse {
  warnings?: string[];
  gene_id: string;
  suggestions?: DomainParams[];
}
/**
 * Fields for individual domain suggestion entries
 */
export interface DomainParams {
  interpro_id: CURIE;
  domain_name: string;
  start: number;
  end: number;
  refseq_ac: string;
}
/**
 * Categorical gene fusions are generalized concepts representing a class
 * of fusions by their shared attributes, such as retained or lost regulatory
 * elements and/or functional domains, and are typically curated from the
 * biomedical literature for use in genomic knowledgebases.
 */
export interface CategoricalFusion {
  type?: "CategoricalFusion";
  regulatory_element?: RegulatoryElement;
  structural_elements: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | MultiplePossibleGenesElement
  )[];
  r_frame_preserved?: boolean;
  critical_functional_domains?: FunctionalDomain[];
}
/**
 * Define MultiplePossibleGenesElement class. This is primarily intended to
 * represent a partner in a categorical fusion, typifying generalizable
 * characteristics of a class of fusions such as retained or lost regulatory elements
 * and/or functional domains, often curated from biomedical literature for use in
 * genomic knowledgebases. For example, EWSR1 rearrangements are often found in Ewing
 * and Ewing-like small round cell sarcomas, regardless of the partner gene.
 * We would associate this assertion with the fusion of EWSR1 with a
 * MultiplePossibleGenesElement.
 */
export interface MultiplePossibleGenesElement {
  type?: "MultiplePossibleGenesElement";
}
/**
 * Define FunctionalDomain class
 */
export interface FunctionalDomain {
  type?: "FunctionalDomain";
  status: DomainStatus;
  associated_gene: Gene;
  _id?: CURIE;
  label?: string;
  sequence_location?: SequenceLocation;
}
/**
 * Assayed fusion with client-oriented structural element models. Used in
 * global FusionContext.
 */
export interface ClientAssayedFusion {
  type?: "AssayedFusion";
  regulatory_element?: ClientRegulatoryElement;
  structural_elements: (
    | ClientTranscriptSegmentElement
    | ClientGeneElement
    | ClientTemplatedSequenceElement
    | ClientLinkerElement
    | ClientUnknownGeneElement
  )[];
  causative_event: CausativeEvent;
  assay: Assay;
}
/**
 * Define regulatory element object used client-side.
 */
export interface ClientRegulatoryElement {
  type?: "RegulatoryElement";
  regulatory_class: RegulatoryClass;
  feature_id?: string;
  associated_gene?: Gene;
  feature_location?: SequenceLocation;
  display_class: string;
  nomenclature: string;
}
/**
 * TranscriptSegment element class used client-side.
 */
export interface ClientTranscriptSegmentElement {
  element_id: string;
  nomenclature: string;
  type?: "TranscriptSegmentElement";
  transcript: CURIE;
  exon_start?: number;
  exon_start_offset?: number;
  exon_end?: number;
  exon_end_offset?: number;
  gene: Gene;
  element_genomic_start?: SequenceLocation;
  element_genomic_end?: SequenceLocation;
  input_type: "genomic_coords_gene" | "genomic_coords_tx" | "exon_coords_tx";
  input_tx?: string;
  input_strand?: Strand;
  input_gene?: string;
  input_chr?: string;
  input_genomic_start?: string;
  input_genomic_end?: string;
  input_exon_start?: string;
  input_exon_start_offset?: string;
  input_exon_end?: string;
  input_exon_end_offset?: string;
}
/**
 * Gene element used client-side.
 */
export interface ClientGeneElement {
  element_id: string;
  nomenclature: string;
  type?: "GeneElement";
  gene: Gene;
}
/**
 * Templated sequence element used client-side.
 */
export interface ClientTemplatedSequenceElement {
  element_id: string;
  nomenclature: string;
  type?: "TemplatedSequenceElement";
  region: SequenceLocation;
  strand: Strand;
  input_chromosome?: string;
  input_start?: string;
  input_end?: string;
}
/**
 * Linker element class used client-side.
 */
export interface ClientLinkerElement {
  element_id: string;
  nomenclature: string;
  type?: "LinkerSequenceElement";
  linker_sequence: SequenceDescriptor;
}
/**
 * Unknown gene element used client-side.
 */
export interface ClientUnknownGeneElement {
  element_id: string;
  nomenclature: string;
  type?: "UnknownGeneElement";
}
/**
 * Categorial fusion with client-oriented structural element models. Used in
 * global FusionContext.
 */
export interface ClientCategoricalFusion {
  type?: "CategoricalFusion";
  regulatory_element?: ClientRegulatoryElement;
  structural_elements: (
    | ClientTranscriptSegmentElement
    | ClientGeneElement
    | ClientTemplatedSequenceElement
    | ClientLinkerElement
    | ClientMultiplePossibleGenesElement
  )[];
  r_frame_preserved?: boolean;
  critical_functional_domains?: ClientFunctionalDomain[];
}
/**
 * Multiple possible gene element used client-side.
 */
export interface ClientMultiplePossibleGenesElement {
  element_id: string;
  nomenclature: string;
  type?: "MultiplePossibleGenesElement";
}
/**
 * Define functional domain object used client-side.
 */
export interface ClientFunctionalDomain {
  type?: "FunctionalDomain";
  status: DomainStatus;
  associated_gene: Gene;
  _id?: CURIE;
  label?: string;
  sequence_location?: SequenceLocation;
  domain_id: string;
}
/**
 * Abstract class to provide identification properties used by client.
 */
export interface ClientStructuralElement {
  element_id: string;
  nomenclature: string;
}
/**
 * Response model for genomic coordinates retrieval
 */
export interface CoordsUtilsResponse {
  warnings?: string[];
  coordinates_data?: GenomicData;
}
/**
 * Model containing genomic and transcript exon data.
 */
export interface GenomicData {
  gene: string;
  chr: string;
  start?: number;
  end?: number;
  exon_start?: number;
  exon_start_offset?: number;
  exon_end?: number;
  exon_end_offset?: number;
  transcript: string;
  strand: number;
}
/**
 * Response model for demo fusion object retrieval endpoints.
 */
export interface DemoResponse {
  warnings?: string[];
  fusion: ClientAssayedFusion | ClientCategoricalFusion;
}
/**
 * Request model for genomic coordinates retrieval
 */
export interface ExonCoordsRequest {
  tx_ac: string;
  gene?: string;
  exon_start?: number;
  exon_start_offset?: number;
  exon_end?: number;
  exon_end_offset?: number;
}
/**
 * Response model for gene element construction endoint.
 */
export interface GeneElementResponse {
  warnings?: string[];
  element?: GeneElement;
}
/**
 * Response model for functional domain constructor endpoint.
 */
export interface GetDomainResponse {
  warnings?: string[];
  domain?: FunctionalDomain;
}
/**
 * Response model for MANE transcript retrieval endpoint.
 */
export interface GetTranscriptsResponse {
  warnings?: string[];
  transcripts?: ManeGeneTranscript[];
}
/**
 * Base object containing MANE-provided gene transcript metadata
 */
export interface ManeGeneTranscript {
  "#NCBI_GeneID": string;
  Ensembl_Gene: string;
  HGNC_ID: string;
  symbol: string;
  name: string;
  RefSeq_nuc: string;
  RefSeq_prot: string;
  Ensembl_nuc: string;
  Ensembl_prot: string;
  MANE_status: string;
  GRCh38_chr: string;
  chr_start: string;
  chr_end: string;
  chr_strand: string;
}
/**
 * Response model for regulatory element nomenclature endpoint.
 */
export interface NomenclatureResponse {
  warnings?: string[];
  nomenclature?: string;
}
/**
 * Response model for gene normalization endpoint.
 */
export interface NormalizeGeneResponse {
  warnings?: string[];
  term: string;
  concept_id?: CURIE;
  symbol?: string;
  cased?: string;
}
/**
 * Response model for regulatory element constructor.
 */
export interface RegulatoryElementResponse {
  warnings?: string[];
  regulatory_element: RegulatoryElement;
}
/**
 * Abstract Response class for defining API response structures.
 */
export interface Response {
  warnings?: string[];
}
/**
 * Response model for sequence ID retrieval endpoint.
 */
export interface SequenceIDResponse {
  warnings?: string[];
  sequence: string;
  refseq_id?: string;
  ga4gh_id?: string;
  aliases?: string[];
}
/**
 * Response model for service_info endpoint.
 */
export interface ServiceInfoResponse {
  warnings?: string[];
  curfu_version: string;
  fusor_version: string;
  cool_seq_tool_version: string;
}
/**
 * Response model for gene autocomplete suggestions endpoint.
 */
export interface SuggestGeneResponse {
  warnings?: string[];
  term: string;
  matches_count: number;
  concept_id?: [string, string, string, string, string][];
  symbol?: [string, string, string, string, string][];
  prev_symbols?: [string, string, string, string, string][];
  aliases?: [string, string, string, string, string][];
}
/**
 * Response model for transcript segment element construction endpoint.
 */
export interface TemplatedSequenceElementResponse {
  warnings?: string[];
  element?: TemplatedSequenceElement;
}
/**
 * Response model for transcript segment element construction endpoint.
 */
export interface TxSegmentElementResponse {
  warnings?: string[];
  element?: TranscriptSegmentElement;
}
/**
 * Response model for Fusion validation endpoint.
 */
export interface ValidateFusionResponse {
  warnings?: string[];
  fusion?: CategoricalFusion | AssayedFusion;
}
