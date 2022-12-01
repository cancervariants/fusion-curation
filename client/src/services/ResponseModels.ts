/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

/**
 * Define possible classes of Regulatory Elements. Options are the possible values
 *     for /regulatory_class value property in the INSDC controlled vocabulary:
 *     https://www.insdc.org/controlled-vocabulary-regulatoryclass
 *
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
 * A string that refers to an object uniquely.  The lifetime and scope of
 * an id is defined by the sender. VRS does not impose any constraints on
 * strings used as ids in messages. However, to maximize sharability of data,
 * VRS RECOMMENDS that implementations use [W3C Compact URI (CURIE)]
 * (https://www.w3.org/TR/curie/) syntax. String CURIEs are represented as
 * `prefix`:`reference` (W3C terminology), but often referred to as `
 * namespace`:`accession` or `namespace`:`local id` colloquially. VRS also
 * RECOMMENDS that `prefix` be defined in identifiers.org. The `reference`
 * component is an unconstrained string. A CURIE is a URI.  URIs may *locate*
 * objects (i.e., specify where to retrieve them) or *name* objects
 * conceptually.  VRS uses CURIEs primarily as a naming mechanism.
 * Implementations MAY provide CURIE resolution mechanisms for prefixes to
 * make these objects locatable. Using internal ids in public messages is
 * strongly discouraged.
 */
export type CURIE = string;
/**
 * A range comparator.
 */
export type Comparator = "<=" | ">=";
/**
 * A interval on a stained metaphase chromosome specified by cytobands.
 * CytobandIntervals include the regions described by the start and end
 * cytobands.
 */
export type HumanCytoband = string;
/**
 * Define possible values for strand
 */
export type Strand = "+" | "-";
/**
 * A character string of residues that represents a biological sequence
 * using the conventional sequence order (5’-to-3’ for nucleic acid sequences,
 * and amino-to-carboxyl for amino acid sequences). IUPAC ambiguity codes
 * are permitted in Sequences.
 */
export type Sequence = string;
/**
 * Permissible values for describing the underlying causative event driving an
 *     assayed fusion.
 *
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
  associated_gene?: GeneDescriptor;
  feature_location?: LocationDescriptor;
}
/**
 * This descriptor is intended to reference VRS Gene value objects.
 */
export interface GeneDescriptor {
  id: CURIE;
  type?: "GeneDescriptor";
  label?: string;
  description?: string;
  xrefs?: CURIE[];
  alternate_labels?: string[];
  extensions?: Extension[];
  gene_id?: CURIE;
  gene?: Gene;
}
/**
 * The Extension class provides VODs with a means to extend descriptions
 * with other attributes unique to a content provider. These extensions are
 * not expected to be natively understood under VRSATILE, but may be used
 * for pre-negotiated exchange of message attributes when needed.
 */
export interface Extension {
  type?: "Extension";
  name: string;
  value?: unknown;
}
/**
 * A gene is an authoritative representation of one or more heritable
 * :ref:`Locations <Location>` that includes all sequence elements necessary
 * to perform a biological function. A gene may include regulatory,
 * transcribed, and/or other functional Locations.
 */
export interface Gene {
  type?: "Gene";
  gene_id: CURIE;
}
/**
 * This descriptor is intended to reference VRS Location value objects.
 */
export interface LocationDescriptor {
  id: CURIE;
  type?: "LocationDescriptor";
  label?: string;
  description?: string;
  xrefs?: CURIE[];
  alternate_labels?: string[];
  extensions?: Extension[];
  location_id?: CURIE;
  location?: SequenceLocation | ChromosomeLocation;
}
/**
 * A Location defined by an interval on a referenced Sequence.
 */
export interface SequenceLocation {
  _id?: CURIE;
  type?: "SequenceLocation";
  sequence_id: CURIE;
  interval: SequenceInterval | SimpleInterval;
}
/**
 * A SequenceInterval represents a span of sequence. Positions are always
 * represented by contiguous spans using interbase coordinates.
 * SequenceInterval is intended to be compatible with that in Sequence
 * Ontology ([SO:0000001](http://www.sequenceontology.org/browser/
 * current_svn/term/SO:0000001)), with the exception that the GA4GH VRS
 * SequenceInterval may be zero-width. The SO definition is for an extent
 * greater than zero.
 */
export interface SequenceInterval {
  type?: "SequenceInterval";
  start: Number | IndefiniteRange | DefiniteRange;
  end: Number | IndefiniteRange | DefiniteRange;
}
/**
 * A simple number value as a VRS class.
 */
export interface Number {
  type?: "Number";
  value: number;
}
/**
 * An indefinite range represented as a number and associated comparator.
 * The bound operator is interpreted as follows: `>=` are all values greater
 * than and including the value, `<=` are all numbers less than and including
 * the value.
 */
export interface IndefiniteRange {
  type?: "IndefiniteRange";
  value: number;
  comparator: Comparator;
}
/**
 * A bounded, inclusive range of numbers.
 */
export interface DefiniteRange {
  type?: "DefiniteRange";
  min: number;
  max: number;
}
/**
 * DEPRECATED: A SimpleInterval represents a span of sequence. Positions
 * are always represented by contiguous spans using interbase coordinates.
 * This class is deprecated. Use SequenceInterval instead.
 */
export interface SimpleInterval {
  type?: "SimpleInterval";
  start: number;
  end: number;
}
/**
 * A Location on a chromosome defined by a species and chromosome name.
 */
export interface ChromosomeLocation {
  type?: "ChromosomeLocation";
  _id?: CURIE;
  species_id: CURIE;
  chr: string;
  interval: CytobandInterval;
}
/**
 * A contiguous region specified by chromosomal bands features.
 */
export interface CytobandInterval {
  type?: "CytobandInterval";
  start: HumanCytoband;
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
  gene_descriptor: GeneDescriptor;
  element_genomic_start?: LocationDescriptor;
  element_genomic_end?: LocationDescriptor;
}
/**
 * Define Gene Element class.
 */
export interface GeneElement {
  type?: "GeneElement";
  gene_descriptor: GeneDescriptor;
}
/**
 * Define Templated Sequence Element class.
 * A templated sequence is a contiguous genomic sequence found in the gene
 * product.
 */
export interface TemplatedSequenceElement {
  type?: "TemplatedSequenceElement";
  region: LocationDescriptor;
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
 * This descriptor is intended to reference VRS Sequence value objects.
 */
export interface SequenceDescriptor {
  id: CURIE;
  type?: "SequenceDescriptor";
  label?: string;
  description?: string;
  xrefs?: CURIE[];
  alternate_labels?: string[];
  extensions?: Extension[];
  sequence_id?: CURIE;
  sequence?: Sequence;
  residue_type?: CURIE;
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
  associated_gene: GeneDescriptor;
  _id?: CURIE;
  label?: string;
  sequence_location?: LocationDescriptor;
}
/**
 * Assayed fusion with client-oriented structural element models. Used in
 * global FusionContext.
 */
export interface ClientAssayedFusion {
  type?: "AssayedFusion";
  regulatory_element?: RegulatoryElement;
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
  gene_descriptor: GeneDescriptor;
  element_genomic_start?: LocationDescriptor;
  element_genomic_end?: LocationDescriptor;
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
  gene_descriptor: GeneDescriptor;
}
/**
 * Templated sequence element used client-side.
 */
export interface ClientTemplatedSequenceElement {
  element_id: string;
  nomenclature: string;
  type?: "TemplatedSequenceElement";
  region: LocationDescriptor;
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
  regulatory_element?: RegulatoryElement;
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
  associated_gene: GeneDescriptor;
  _id?: CURIE;
  label?: string;
  sequence_location?: LocationDescriptor;
  domain_id: string;
}
/**
 * Define regulatory element object used client-side.
 */
export interface ClientRegulatoryElement {
  type?: "RegulatoryElement";
  regulatory_class: RegulatoryClass;
  feature_id?: string;
  associated_gene?: GeneDescriptor;
  feature_location?: LocationDescriptor;
  display_class: string;
  nomenclature: string;
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
  symbols?: [string, string, string][];
  prev_symbols?: [string, string, string][];
  aliases?: [string, string, string][];
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
