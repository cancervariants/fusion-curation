/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

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
 * A character string of residues that represents a biological sequence
 * using the conventional sequence order (5’-to-3’ for nucleic acid sequences,
 * and amino-to-carboxyl for amino acid sequences). IUPAC ambiguity codes
 * are permitted in Sequences.
 */
export type Sequence = string;
/**
 * Define possible values for strand
 */
export type Strand = "+" | "-";
/**
 * Define possible statuses of critical domains.
 */
export type DomainStatus = "lost" | "preserved";
/**
 * Define Event class (causative event)
 */
export type Event = "rearrangement" | "read-through" | "trans-splicing";
/**
 * Define possible types of Regulatory Elements.
 */
export type RegulatoryElementType = "promoter" | "enhancer";

/**
 * Define AnyGene class. This is primarily intended to represent a partner in a categorical
 * fusion, typifying generalizable characteristics of a class of fusions such as retained or
 * lost regulatory elements and/or functional domains, often curated from biomedical literature
 * for use in genomic knowledgebases. For example, EWSR1 rearrangements are often found in
 * Ewing and Ewing-like small round cell sarcomas, regardless of the partner gene. We would
 * associate this assertion with the fusion of EWSR1 with an AnyGene component.
 */
export interface AnyGeneComponent {
  component_type?: "any_gene";
}
/**
 * Response model for domain ID autocomplete suggestion endpoint.
 */
export interface AssociatedDomainResponse {
  gene_id: string;
  suggestions?: [] | [string] | [string, string][];
  warnings?: string[];
}
/**
 * Any gene component used client-side.
 */
export interface ClientAnyGeneComponent {
  uuid: string;
  component_name: string;
  component_type?: "any_gene";
}
/**
 * Abstract class to provide identification properties used by client.
 */
export interface ClientComponent {
  uuid: string;
  component_name: string;
}
/**
 * Gene component used client-side.
 */
export interface ClientGeneComponent {
  uuid: string;
  component_name: string;
  component_type?: "gene";
  gene_descriptor: GeneDescriptor;
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
 * GenomicRegion component used client-side.
 */
export interface ClientGenomicRegionComponent {
  uuid: string;
  component_name: string;
  component_type?: "genomic_region";
  region: LocationDescriptor;
  strand: Strand;
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
  sequence_descriptor?: SequenceDescriptor;
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
 * DEPRECATED: A SimpleInterval represents a span of sequence.
 * Positions are always represented by contiguous spans using interbase
 * coordinates. This class is deprecated. Use SequenceInterval instead.
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
 * Linker component class used client-side.
 */
export interface ClientLinkerComponent {
  uuid: string;
  component_name: string;
  component_type?: "linker_sequence";
  linker_sequence: SequenceDescriptor;
}
/**
 * TranscriptSegment component class used client-side.
 */
export interface ClientTranscriptSegmentComponent {
  uuid: string;
  component_name: string;
  component_type?: "transcript_segment";
  transcript: CURIE;
  exon_start: number;
  exon_start_offset?: number;
  exon_end: number;
  exon_end_offset?: number;
  gene_descriptor: GeneDescriptor;
  component_genomic_region: LocationDescriptor;
}
/**
 * Unknown gene component used client-side.
 */
export interface ClientUnknownGeneComponent {
  uuid: string;
  component_name: string;
  component_type?: "unknown_gene";
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
 * Response model for genomic coordinates retrieval
 */
export interface ExonCoordsResponse {
  tx_ac?: string;
  gene?: string;
  gene_id?: string;
  exon_start?: number;
  exon_start_offset?: number;
  exon_end?: number;
  exon_end_offset?: number;
  sequence_id?: CURIE;
  chr?: string;
  start?: number;
  end?: number;
  warnings?: string[];
}
/**
 * Define Fusion class
 */
export interface Fusion {
  r_frame_preserved?: boolean;
  protein_domains?: CriticalDomain[];
  transcript_components: (
    | TranscriptSegmentComponent
    | GeneComponent
    | GenomicRegionComponent
    | LinkerComponent
    | UnknownGeneComponent
  )[];
  causative_event?: Event;
  regulatory_elements?: RegulatoryElement[];
}
/**
 * Define CriticalDomain class
 */
export interface CriticalDomain {
  status: DomainStatus;
  name: string;
  id: CURIE;
  gene_descriptor: GeneDescriptor;
}
/**
 * Define TranscriptSegment class
 */
export interface TranscriptSegmentComponent {
  component_type?: "transcript_segment";
  transcript: CURIE;
  exon_start: number;
  exon_start_offset?: number;
  exon_end: number;
  exon_end_offset?: number;
  gene_descriptor: GeneDescriptor;
  component_genomic_region: LocationDescriptor;
}
/**
 * Define Gene component class.
 */
export interface GeneComponent {
  component_type?: "gene";
  gene_descriptor: GeneDescriptor;
}
/**
 * Define GenomicRegion component class.
 */
export interface GenomicRegionComponent {
  component_type?: "genomic_region";
  region: LocationDescriptor;
  strand: Strand;
}
/**
 * Define Linker class (linker sequence)
 */
export interface LinkerComponent {
  component_type?: "linker_sequence";
  linker_sequence: SequenceDescriptor;
}
/**
 * Define UnknownGene class. This is primarily intended to represent a partner in the result of
 * a fusion partner-agnostic assay, which identifies the absence of an expected gene. For
 * example, a FISH break-apart probe may indicate rearrangement of an MLL gene, but by design,
 * the test cannot provide the identity of the new partner. In this case, we would associate any
 * clinical observations from this patient with the fusion of MLL with an UnknownGene component.
 */
export interface UnknownGeneComponent {
  component_type?: "unknown_gene";
}
/**
 * Define RegulatoryElement class
 */
export interface RegulatoryElement {
  type: RegulatoryElementType;
  gene_descriptor: GeneDescriptor;
}
/**
 * Response model for fusion validation endpoint.
 */
export interface FusionValidationResponse {
  fusion?: Fusion;
  warnings?: string[];
}
/**
 * Response model for gene normalization endpoint.
 */
export interface NormalizeGeneResponse {
  term: string;
  concept_id?: CURIE;
  warnings?: string[];
}
/**
 * Response model for sequence ID retrieval endpoint.
 */
export interface SequenceIDResponse {
  sequence: string;
  sequence_id?: string;
  warnings?: string[];
}
/**
 * Response model for gene autocomplete suggestions endpoint.
 */
export interface SuggestGeneResponse {
  term: string;
  suggestions?: [] | [string] | [string, string] | [string, string, string] | [string, string, string, string][];
  warnings?: string[];
}
