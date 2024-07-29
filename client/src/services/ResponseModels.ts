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
 * Indicates that the value is taken from a set of controlled strings defined elsewhere. Technically, a code is restricted to a string which has at least one character and no leading or  trailing whitespace, and where there is no whitespace other than single spaces in the contents.
 */
export type Code = string;
/**
 * A mapping relation between concepts as defined by the Simple Knowledge
 * Organization System (SKOS).
 */
export type Relation =
  | "closeMatch"
  | "exactMatch"
  | "broadMatch"
  | "narrowMatch"
  | "relatedMatch";
/**
 * An IRI Reference (either an IRI or a relative-reference), according to `RFC3986 section 4.1  <https://datatracker.ietf.org/doc/html/rfc3986#section-4.1>` and `RFC3987 section 2.1 <https://datatracker.ietf.org/doc/html/rfc3987#section-2.1>`. MAY be a JSON Pointer as an IRI fragment, as  described by `RFC6901 section 6 <https://datatracker.ietf.org/doc/html/rfc6901#section-6>`.
 */
export type IRI = string;
/**
 * The interpretation of the character codes referred to by the refget accession,
 * where "aa" specifies an amino acid character set, and "na" specifies a nucleic acid
 * character set.
 */
export type ResidueAlphabet = "aa" | "na";
/**
 * An inclusive range of values bounded by one or more integers.
 */
export type Range = [number | null, number | null];
/**
 * A character string of Residues that represents a biological sequence using the conventional sequence order (5'-to-3' for nucleic acid sequences, and amino-to-carboxyl for amino acid sequences). IUPAC ambiguity codes are permitted in Sequence Strings.
 */
export type SequenceString = string;
/**
 * Create enum for positive and negative strand
 */
export type Strand = 1 | -1;
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
  regulatoryElement?: RegulatoryElement | null;
  structure: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | UnknownGeneElement
  )[];
  readingFramePreserved?: boolean | null;
  causativeEvent?: CausativeEvent | null;
  assay?: Assay | null;
}
/**
 * Define RegulatoryElement class.
 *
 * `featureId` would ideally be constrained as a CURIE, but Encode, our preferred
 * feature ID source, doesn't currently have a registered CURIE structure for EH_
 * identifiers. Consequently, we permit any kind of free text.
 */
export interface RegulatoryElement {
  type?: "RegulatoryElement";
  regulatoryClass: RegulatoryClass;
  featureId?: string | null;
  associatedGene?: Gene | null;
  featureLocation?: SequenceLocation | null;
}
/**
 * A basic physical and functional unit of heredity.
 */
export interface Gene {
  /**
   * The 'logical' identifier of the entity in the system of record, e.g. a UUID. This 'id' is unique within a given system. The identified entity may have a different 'id' in a different system, or may refer to an 'id' for the shared concept in another system (e.g. a CURIE).
   */
  id?: string | null;
  /**
   * MUST be "Gene".
   */
  type?: "Gene";
  /**
   * A primary label for the entity.
   */
  label?: string | null;
  /**
   * A free-text description of the entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  alternativeLabels?: string[] | null;
  /**
   * A list of extensions to the entity. Extensions are not expected to be natively understood, but may be used for pre-negotiated exchange of message attributes between systems.
   */
  extensions?: Extension[] | null;
  /**
   * A list of mappings to concepts in terminologies or code systems. Each mapping should include a coding and a relation.
   */
  mappings?: ConceptMapping[] | null;
  [k: string]: unknown;
}
/**
 * The Extension class provides entities with a means to include additional
 * attributes that are outside of the specified standard but needed by a given content
 * provider or system implementer. These extensions are not expected to be natively
 * understood, but may be used for pre-negotiated exchange of message attributes
 * between systems.
 */
export interface Extension {
  /**
   * A name for the Extension. Should be indicative of its meaning and/or the type of information it value represents.
   */
  name: string;
  /**
   * The value of the Extension - can be any primitive or structured object
   */
  value?:
    | number
    | string
    | boolean
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | null;
  /**
   * A description of the meaning or utility of the Extension, to explain the type of information it is meant to hold.
   */
  description?: string | null;
  [k: string]: unknown;
}
/**
 * A mapping to a concept in a terminology or code system.
 */
export interface ConceptMapping {
  /**
   * A structured representation of a code for a defined concept in a terminology or code system.
   */
  coding: Coding;
  /**
   * A mapping relation between concepts as defined by the Simple Knowledge Organization System (SKOS).
   */
  relation: Relation;
  [k: string]: unknown;
}
/**
 * A structured representation of a code for a defined concept in a terminology or
 * code system.
 */
export interface Coding {
  /**
   * The human-readable name for the coded concept, as defined by the code system.
   */
  label?: string | null;
  /**
   * The terminology/code system that defined the code. May be reported as a free-text name (e.g. 'Sequence Ontology'), but it is preferable to provide a uri/url for the system. When the 'code' is reported as a CURIE, the 'system' should be reported as the uri that the CURIE's prefix expands to (e.g. 'http://purl.obofoundry.org/so.owl/' for the Sequence Ontology).
   */
  system: string;
  /**
   * Version of the terminology or code system that provided the code.
   */
  version?: string | null;
  /**
   * A symbol uniquely identifying the concept, as in a syntax defined by the code system. CURIE format is preferred where possible (e.g. 'SO:0000704' is the CURIE form of the Sequence Ontology code for 'gene').
   */
  code: Code;
  [k: string]: unknown;
}
/**
 * A `Location` defined by an interval on a referenced `Sequence`.
 */
export interface SequenceLocation {
  /**
   * The 'logical' identifier of the entity in the system of record, e.g. a UUID. This 'id' is unique within a given system. The identified entity may have a different 'id' in a different system, or may refer to an 'id' for the shared concept in another system (e.g. a CURIE).
   */
  id?: string | null;
  /**
   * MUST be "SequenceLocation"
   */
  type?: "SequenceLocation";
  /**
   * A primary label for the entity.
   */
  label?: string | null;
  /**
   * A free-text description of the entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  alternativeLabels?: string[] | null;
  /**
   * A list of extensions to the entity. Extensions are not expected to be natively understood, but may be used for pre-negotiated exchange of message attributes between systems.
   */
  extensions?: Extension[] | null;
  /**
   * A list of mappings to concepts in terminologies or code systems. Each mapping should include a coding and a relation.
   */
  mappings?: ConceptMapping[] | null;
  /**
   * A sha512t24u digest created using the VRS Computed Identifier algorithm.
   */
  digest?: string | null;
  /**
   * A reference to a `Sequence` on which the location is defined.
   */
  sequenceReference?: IRI | SequenceReference | null;
  /**
   * The start coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. MUST represent a coordinate or range less than the value of `end`.
   */
  start?: Range | number | null;
  /**
   * The end coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. MUST represent a coordinate or range greater than the value of `start`.
   */
  end?: Range | number | null;
  /**
   * The literal sequence encoded by the `sequenceReference` at these coordinates.
   */
  sequence?: SequenceString | null;
  [k: string]: unknown;
}
/**
 * A sequence of nucleic or amino acid character codes.
 */
export interface SequenceReference {
  /**
   * The 'logical' identifier of the entity in the system of record, e.g. a UUID. This 'id' is unique within a given system. The identified entity may have a different 'id' in a different system, or may refer to an 'id' for the shared concept in another system (e.g. a CURIE).
   */
  id?: string | null;
  /**
   * MUST be "SequenceReference"
   */
  type?: "SequenceReference";
  /**
   * A primary label for the entity.
   */
  label?: string | null;
  /**
   * A free-text description of the entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  alternativeLabels?: string[] | null;
  /**
   * A list of extensions to the entity. Extensions are not expected to be natively understood, but may be used for pre-negotiated exchange of message attributes between systems.
   */
  extensions?: Extension[] | null;
  /**
   * A list of mappings to concepts in terminologies or code systems. Each mapping should include a coding and a relation.
   */
  mappings?: ConceptMapping[] | null;
  /**
   * A `GA4GH RefGet <http://samtools.github.io/hts-specs/refget.html>` identifier for the referenced sequence, using the sha512t24u digest.
   */
  refgetAccession: string;
  /**
   * The interpretation of the character codes referred to by the refget accession, where 'aa' specifies an amino acid character set, and 'na' specifies a nucleic acid character set.
   */
  residueAlphabet?: ResidueAlphabet | null;
  /**
   * A boolean indicating whether the molecule represented by the sequence is circular (true) or linear (false).
   */
  circular?: boolean | null;
  [k: string]: unknown;
}
/**
 * Define TranscriptSegment class
 */
export interface TranscriptSegmentElement {
  type?: "TranscriptSegmentElement";
  transcript: string;
  exonStart?: number | null;
  exonStartOffset?: number | null;
  exonEnd?: number | null;
  exonEndOffset?: number | null;
  gene: Gene;
  elementGenomicStart?: SequenceLocation | null;
  elementGenomicEnd?: SequenceLocation | null;
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
  linkerSequence: LiteralSequenceExpression;
}
/**
 * An explicit expression of a Sequence.
 */
export interface LiteralSequenceExpression {
  /**
   * The 'logical' identifier of the entity in the system of record, e.g. a UUID. This 'id' is unique within a given system. The identified entity may have a different 'id' in a different system, or may refer to an 'id' for the shared concept in another system (e.g. a CURIE).
   */
  id?: string | null;
  /**
   * MUST be "LiteralSequenceExpression"
   */
  type?: "LiteralSequenceExpression";
  /**
   * A primary label for the entity.
   */
  label?: string | null;
  /**
   * A free-text description of the entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  alternativeLabels?: string[] | null;
  /**
   * A list of extensions to the entity. Extensions are not expected to be natively understood, but may be used for pre-negotiated exchange of message attributes between systems.
   */
  extensions?: Extension[] | null;
  /**
   * A list of mappings to concepts in terminologies or code systems. Each mapping should include a coding and a relation.
   */
  mappings?: ConceptMapping[] | null;
  /**
   * the literal sequence
   */
  sequence: SequenceString;
  [k: string]: unknown;
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
  eventType: EventType;
  eventDescription?: string | null;
}
/**
 * Information pertaining to the assay used in identifying the fusion.
 */
export interface Assay {
  type?: "Assay";
  assayName?: string | null;
  assayId?: string | null;
  methodUri?: string | null;
  fusionDetection?: Evidence | null;
}
/**
 * Response model for domain ID autocomplete suggestion endpoint.
 */
export interface AssociatedDomainResponse {
  warnings: string[] | null;
  geneId: string;
  suggestions: DomainParams[] | null;
}
/**
 * Fields for individual domain suggestion entries
 */
export interface DomainParams {
  interproId: string;
  domainName: string;
  start: number;
  end: number;
  refseqAc: string;
}
/**
 * Categorical gene fusions are generalized concepts representing a class
 * of fusions by their shared attributes, such as retained or lost regulatory
 * elements and/or functional domains, and are typically curated from the
 * biomedical literature for use in genomic knowledgebases.
 */
export interface CategoricalFusion {
  type?: "CategoricalFusion";
  regulatoryElement?: RegulatoryElement | null;
  structure: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | MultiplePossibleGenesElement
  )[];
  readingFramePreserved?: boolean | null;
  criticalFunctionalDomains?: FunctionalDomain[] | null;
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
  associatedGene: Gene;
  id: string | null;
  label?: string | null;
  sequenceLocation?: SequenceLocation | null;
}
/**
 * Assayed fusion with client-oriented structural element models. Used in
 * global FusionContext.
 */
export interface ClientAssayedFusion {
  type?: "AssayedFusion";
  regulatoryElement?: ClientRegulatoryElement | null;
  structure: (
    | ClientTranscriptSegmentElement
    | ClientGeneElement
    | ClientTemplatedSequenceElement
    | ClientLinkerElement
    | ClientUnknownGeneElement
  )[];
  readingFramePreserved?: boolean | null;
  causativeEvent?: CausativeEvent | null;
  assay?: Assay | null;
}
/**
 * Define regulatory element object used client-side.
 */
export interface ClientRegulatoryElement {
  type?: "RegulatoryElement";
  regulatoryClass: RegulatoryClass;
  featureId?: string | null;
  associatedGene?: Gene | null;
  featureLocation?: SequenceLocation | null;
  displayClass: string;
  nomenclature: string;
}
/**
 * TranscriptSegment element class used client-side.
 */
export interface ClientTranscriptSegmentElement {
  elementId: string;
  nomenclature: string;
  type?: "TranscriptSegmentElement";
  transcript: string;
  exonStart?: number | null;
  exonStartOffset?: number | null;
  exonEnd?: number | null;
  exonEndOffset?: number | null;
  gene: Gene;
  elementGenomicStart?: SequenceLocation | null;
  elementGenomicEnd?: SequenceLocation | null;
  inputType: "genomic_coords_gene" | "genomic_coords_tx" | "exon_coords_tx";
  inputTx: string | null;
  inputStrand: Strand | null;
  inputGene: string | null;
  inputChr: string | null;
  inputGenomicStart: string | null;
  inputGenomicEnd: string | null;
  inputExonStart: string | null;
  inputExonStartOffset: string | null;
  inputExonEnd: string | null;
  inputExonEndOffset: string | null;
}
/**
 * Gene element used client-side.
 */
export interface ClientGeneElement {
  elementId: string;
  nomenclature: string;
  type?: "GeneElement";
  gene: Gene;
}
/**
 * Templated sequence element used client-side.
 */
export interface ClientTemplatedSequenceElement {
  elementId: string;
  nomenclature: string;
  type?: "TemplatedSequenceElement";
  region: SequenceLocation;
  strand: Strand;
  inputChromosome: string | null;
  inputStart: string | null;
  inputEnd: string | null;
}
/**
 * Linker element class used client-side.
 */
export interface ClientLinkerElement {
  elementId: string;
  nomenclature: string;
  type?: "LinkerSequenceElement";
  linkerSequence: LiteralSequenceExpression;
}
/**
 * Unknown gene element used client-side.
 */
export interface ClientUnknownGeneElement {
  elementId: string;
  nomenclature: string;
  type?: "UnknownGeneElement";
}
/**
 * Categorial fusion with client-oriented structural element models. Used in
 * global FusionContext.
 */
export interface ClientCategoricalFusion {
  type?: "CategoricalFusion";
  regulatoryElement?: ClientRegulatoryElement | null;
  structure: (
    | ClientTranscriptSegmentElement
    | ClientGeneElement
    | ClientTemplatedSequenceElement
    | ClientLinkerElement
    | ClientMultiplePossibleGenesElement
  )[];
  readingFramePreserved?: boolean | null;
  criticalFunctionalDomains: ClientFunctionalDomain[] | null;
}
/**
 * Multiple possible gene element used client-side.
 */
export interface ClientMultiplePossibleGenesElement {
  elementId: string;
  nomenclature: string;
  type?: "MultiplePossibleGenesElement";
}
/**
 * Define functional domain object used client-side.
 */
export interface ClientFunctionalDomain {
  type?: "FunctionalDomain";
  status: DomainStatus;
  associatedGene: Gene;
  id: string | null;
  label?: string | null;
  sequenceLocation?: SequenceLocation | null;
  domainId: string;
}
/**
 * Abstract class to provide identification properties used by client.
 */
export interface ClientStructuralElement {
  elementId: string;
  nomenclature: string;
}
/**
 * Response model for genomic coordinates retrieval
 */
export interface CoordsUtilsResponse {
  warnings: string[] | null;
  coordinatesData: GenomicData | null;
}
/**
 * Model containing genomic and transcript exon data.
 */
export interface GenomicData {
  gene: string;
  chr: string;
  start?: number | null;
  end?: number | null;
  exon_start?: number | null;
  exon_start_offset?: number | null;
  exon_end?: number | null;
  exon_end_offset?: number | null;
  transcript: string;
  strand: Strand;
}
/**
 * Response model for demo fusion object retrieval endpoints.
 */
export interface DemoResponse {
  warnings: string[] | null;
  fusion: ClientAssayedFusion | ClientCategoricalFusion;
}
/**
 * Request model for genomic coordinates retrieval
 */
export interface ExonCoordsRequest {
  txAc: string;
  gene?: string | null;
  exonStart?: number | null;
  exonStartOffset?: number | null;
  exonEnd?: number | null;
  exonEndOffset?: number | null;
}
/**
 * Response model for gene element construction endoint.
 */
export interface GeneElementResponse {
  warnings: string[] | null;
  element: GeneElement | null;
}
/**
 * Response model for functional domain constructor endpoint.
 */
export interface GetDomainResponse {
  warnings: string[] | null;
  domain: FunctionalDomain | null;
}
/**
 * Response model for MANE transcript retrieval endpoint.
 */
export interface GetTranscriptsResponse {
  warnings: string[] | null;
  transcripts: ManeGeneTranscript[] | null;
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
  warnings: string[] | null;
  nomenclature: string | null;
}
/**
 * Response model for gene normalization endpoint.
 */
export interface NormalizeGeneResponse {
  warnings: string[] | null;
  term: string;
  conceptId: string | null;
  symbol: string | null;
  cased: string | null;
}
/**
 * Response model for regulatory element constructor.
 */
export interface RegulatoryElementResponse {
  warnings: string[] | null;
  regulatoryElement: RegulatoryElement;
}
/**
 * Abstract Response class for defining API response structures.
 */
export interface Response {
  warnings: string[] | null;
}
/**
 * Response model for sequence ID retrieval endpoint.
 */
export interface SequenceIDResponse {
  warnings: string[] | null;
  sequence: string;
  refseqId: string | null;
  ga4ghId: string | null;
  aliases: string[] | null;
}
/**
 * Response model for service_info endpoint.
 */
export interface ServiceInfoResponse {
  warnings: string[] | null;
  curfu_version: string;
  fusor_version: string;
  cool_seq_tool_version: string;
}
/**
 * Response model for gene autocomplete suggestions endpoint.
 */
export interface SuggestGeneResponse {
  warnings: string[] | null;
  term: string;
  matchesCount: number;
  conceptId: [unknown, unknown, unknown, unknown, unknown][] | null;
  symbol: [unknown, unknown, unknown, unknown, unknown][] | null;
  prevSymbols: [unknown, unknown, unknown, unknown, unknown][] | null;
  aliases: [unknown, unknown, unknown, unknown, unknown][] | null;
}
/**
 * Response model for transcript segment element construction endpoint.
 */
export interface TemplatedSequenceElementResponse {
  warnings: string[] | null;
  element: TemplatedSequenceElement | null;
}
/**
 * Response model for transcript segment element construction endpoint.
 */
export interface TxSegmentElementResponse {
  warnings: string[] | null;
  element: TranscriptSegmentElement | null;
}
/**
 * Response model for Fusion validation endpoint.
 */
export interface ValidateFusionResponse {
  warnings: string[] | null;
  fusion: CategoricalFusion | AssayedFusion | null;
}
