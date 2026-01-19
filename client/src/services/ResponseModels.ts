/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

/**
 * Form of evidence supporting identification of the fusion.
 */
export type Evidence = "observed" | "inferred";
/**
 * Define possible classes of Regulatory Elements.
 *
 * Options are the possible values for ``/regulatory_class`` value property in the
 * `INSDC controlled vocabulary <https://www.insdc.org/controlled-vocabulary-regulatoryclass>`_.
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
 * An IRI Reference (either an IRI or a relative-reference), according to `RFC3986 section 4.1 <https://datatracker.ietf.org/doc/html/rfc3986#section-4.1>`_ and `RFC3987 section 2.1 <https://datatracker.ietf.org/doc/html/rfc3987#section-2.1>`_. MAY be a JSON Pointer as an IRI fragment, as described by `RFC6901 section 6 <https://datatracker.ietf.org/doc/html/rfc6901#section-6>`_.
 */
export type IriReference = string;
/**
 * A mapping relation between concepts as defined by the Simple Knowledge Organization System (SKOS).
 */
export type Relation =
  | "closeMatch"
  | "exactMatch"
  | "broadMatch"
  | "narrowMatch"
  | "relatedMatch";
/**
 * The interpretation of the character codes referred to by the refget accession,
 * where "aa" specifies an amino acid character set, and "na" specifies a nucleic acid
 * character set.
 */
export type ResidueAlphabet = "aa" | "na";
/**
 * A character string of Residues that represents a biological sequence using the conventional sequence order (5'-to-3' for nucleic acid sequences, and amino-to-carboxyl for amino acid sequences). IUPAC ambiguity codes are permitted in Sequence Strings.
 */
export type SequenceString = string;
/**
 * Molecule types as `defined by RefSeq <https://www.ncbi.nlm.nih.gov/books/NBK21091/>`_ (see Table 1).
 */
export type MoleculeType = "genomic" | "RNA" | "mRNA" | "protein";
/**
 * An inclusive range of values bounded by one or more integers.
 */
export type Range = [number | null, number | null];
/**
 * Create Enum for Transcript Priority labels
 */
export type TranscriptPriority =
  | "mane_select"
  | "mane_plus_clinical"
  | "longest_compatible_remaining"
  | "grch38";
/**
 * Create enum for positive and negative strand
 */
export type Strand = 1 | -1;
/**
 * A character string of Residues that represents a biological sequence using the conventional sequence order (5'-to-3' for nucleic acid sequences, and amino-to-carboxyl for amino acid sequences). IUPAC ambiguity codes are permitted in Sequence Strings.
 */
export type SequenceString1 = string;
/**
 * Permissible values for describing the underlying causative event driving an
 * assayed fusion.
 */
export type EventType = "rearrangement" | "read-through" | "trans-splicing";
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
export type AssayedFusion1 = string;
/**
 * Categorical gene fusions are generalized concepts representing a class
 * of fusions by their shared attributes, such as retained or lost regulatory
 * elements and/or functional domains, and are typically curated from the
 * biomedical literature for use in genomic knowledgebases.
 */
export type CategoricalFusion1 = string;

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
 * Assayed gene fusions from biological specimens are directly detected using
 * RNA-based gene fusion assays, or alternatively may be inferred from genomic
 * rearrangements detected by whole genome sequencing or by coarser-scale cytogenomic
 * assays. Example: an EWSR1 fusion inferred from a breakapart FISH assay.
 */
export interface AssayedFusion {
  regulatoryElement?: RegulatoryElement | null;
  structure: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | UnknownGeneElement
    | ContigSequence
    | ReadData
  )[];
  fivePrimeJunction?: string | null;
  threePrimeJunction?: string | null;
  readingFramePreserved?: boolean | null;
  type?: "AssayedFusion";
  viccNomenclature?: string | null;
  causativeEvent?: CausativeEvent | null;
  assay?: Assay | null;
  contig?: ContigSequence | null;
  readData?: ReadData | null;
}
/**
 * Define RegulatoryElement class.
 *
 * ``featureId`` would ideally be constrained as a CURIE, but Encode, our preferred
 * feature ID source, doesn't currently have a registered CURIE structure for ``EH_``
 * identifiers. Consequently, we permit any kind of free text.
 */
export interface RegulatoryElement {
  type?: "RegulatoryElement";
  regulatoryClass: RegulatoryClass;
  featureId?: string | null;
  associatedGene?: MappableConcept | null;
  featureLocation?: GenomicLocation | null;
}
/**
 * A concept based on a primaryCoding and/or name that may be mapped to one or more other `Codings`.
 */
export interface MappableConcept {
  /**
   * The 'logical' identifier of the data element in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * A term indicating the type of concept being represented by the MappableConcept.
   */
  conceptType?: string | null;
  /**
   * A primary name for the concept.
   */
  name?: string | null;
  /**
   * A primary coding for the concept.
   */
  primaryCoding?: Coding | null;
  /**
   * A list of mappings to concepts in terminologies or code systems. Each mapping should include a coding and a relation.
   */
  mappings?: ConceptMapping[] | null;
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
   * The 'logical' identifier of the data element in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * A name for the Extension. Should be indicative of its meaning and/or the type of information it value represents.
   */
  name: string;
  /**
   * The value of the Extension - can be any primitive or structured object
   */
  value:
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
}
/**
 * A structured representation of a code for a defined concept in a terminology or
 * code system.
 */
export interface Coding {
  /**
   * The 'logical' identifier of the data element in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * The human-readable name for the coded concept, as defined by the code system.
   */
  name?: string | null;
  /**
   * The terminology/code system that defined the code. May be reported as a free-text name (e.g. 'Sequence Ontology'), but it is preferable to provide a uri/url for the system.
   */
  system: string;
  /**
   * Version of the terminology or code system that provided the code.
   */
  systemVersion?: string | null;
  code: Code;
  /**
   * A list of IRIs that are associated with the coding. This can be used to provide additional context or to link to additional information about the concept.
   */
  iris?: IriReference[] | null;
}
/**
 * A mapping to a concept in a terminology or code system.
 */
export interface ConceptMapping {
  /**
   * The 'logical' identifier of the data element in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  coding: Coding1;
  relation: Relation;
}
/**
 * A structured representation of a code for a defined concept in a terminology or
 * code system.
 */
export interface Coding1 {
  /**
   * The 'logical' identifier of the data element in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * The human-readable name for the coded concept, as defined by the code system.
   */
  name?: string | null;
  /**
   * The terminology/code system that defined the code. May be reported as a free-text name (e.g. 'Sequence Ontology'), but it is preferable to provide a uri/url for the system.
   */
  system: string;
  /**
   * Version of the terminology or code system that provided the code.
   */
  systemVersion?: string | null;
  code: Code;
  /**
   * A list of IRIs that are associated with the coding. This can be used to provide additional context or to link to additional information about the concept.
   */
  iris?: IriReference[] | null;
}
/**
 * Define GenomicLocation class
 */
export interface GenomicLocation {
  /**
   * The 'logical' identifier of the Entity in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * MUST be "SequenceLocation"
   */
  type?: "SequenceLocation";
  name: string;
  /**
   * A free-text description of the Entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  aliases?: string[] | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * A sha512t24u digest created using the VRS Computed Identifier algorithm.
   */
  digest?: string | null;
  /**
   * A reference to a SequenceReference on which the location is defined.
   */
  sequenceReference?: IriReference | SequenceReference | null;
  /**
   * The start coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. For locations on linear sequences, this MUST represent a coordinate or range less than or equal to the value of `end`. For circular sequences, `start` is greater than `end` when the location spans the sequence 0 coordinate.
   */
  start?: Range | number | null;
  /**
   * The end coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. For locations on linear sequences, this MUST represent a coordinate or range greater than or equal to the value of `start`. For circular sequences, `end` is less than `start` when the location spans the sequence 0 coordinate.
   */
  end?: Range | number | null;
  /**
   * The literal sequence encoded by the `sequenceReference` at these coordinates.
   */
  sequence?: SequenceString | null;
}
/**
 * A sequence of nucleic or amino acid character codes.
 */
export interface SequenceReference {
  /**
   * The 'logical' identifier of the Entity in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * MUST be "SequenceReference"
   */
  type?: "SequenceReference";
  /**
   * A primary name for the entity.
   */
  name?: string | null;
  /**
   * A free-text description of the Entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  aliases?: string[] | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * A [GA4GH RefGet](http://samtools.github.io/hts-specs/refget.html) identifier for the referenced sequence, using the sha512t24u digest.
   */
  refgetAccession: string;
  /**
   * The interpretation of the character codes referred to by the refget accession, where "aa" specifies an amino acid character set, and "na" specifies a nucleic acid character set.
   */
  residueAlphabet?: ResidueAlphabet | null;
  /**
   * A boolean indicating whether the molecule represented by the sequence is circular (true) or linear (false).
   */
  circular?: boolean | null;
  /**
   * A sequenceString that is a literal representation of the referenced sequence.
   */
  sequence?: SequenceString | null;
  /**
   * Molecule types as [defined by RefSeq](https://www.ncbi.nlm.nih.gov/books/NBK21091/) (see Table 1). MUST be one of 'genomic', 'RNA', 'mRNA', or 'protein'.
   */
  moleculeType?: MoleculeType | null;
}
/**
 * Define TranscriptSegmentElement class
 */
export interface TranscriptSegmentElement {
  type?: "TranscriptSegmentElement";
  transcript: string;
  transcriptStatus: TranscriptPriority;
  strand: Strand;
  exonStart?: number | null;
  exonStartOffset?: number | null;
  exonEnd?: number | null;
  exonEndOffset?: number | null;
  gene: MappableConcept;
  elementGenomicStart?: SequenceLocation | null;
  elementGenomicEnd?: SequenceLocation | null;
  coverage?: BreakpointCoverage | null;
  anchoredReads?: AnchoredReads | null;
}
/**
 * A `Location` defined by an interval on a `Sequence`.
 */
export interface SequenceLocation {
  /**
   * The 'logical' identifier of the Entity in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * MUST be "SequenceLocation"
   */
  type?: "SequenceLocation";
  /**
   * A primary name for the entity.
   */
  name?: string | null;
  /**
   * A free-text description of the Entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  aliases?: string[] | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * A sha512t24u digest created using the VRS Computed Identifier algorithm.
   */
  digest?: string | null;
  /**
   * A reference to a SequenceReference on which the location is defined.
   */
  sequenceReference?: IriReference | SequenceReference | null;
  /**
   * The start coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. For locations on linear sequences, this MUST represent a coordinate or range less than or equal to the value of `end`. For circular sequences, `start` is greater than `end` when the location spans the sequence 0 coordinate.
   */
  start?: Range | number | null;
  /**
   * The end coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. For locations on linear sequences, this MUST represent a coordinate or range greater than or equal to the value of `start`. For circular sequences, `end` is less than `start` when the location spans the sequence 0 coordinate.
   */
  end?: Range | number | null;
  /**
   * The literal sequence encoded by the `sequenceReference` at these coordinates.
   */
  sequence?: SequenceString | null;
}
/**
 * Define BreakpointCoverage class.
 *
 * This class models breakpoint coverage, or the number of fragments
 * that are retained near the breakpoint for a fusion partner
 */
export interface BreakpointCoverage {
  type?: "BreakpointCoverage";
  fragmentCoverage: number;
  [k: string]: unknown;
}
/**
 * Define AnchoredReads class
 *
 * This class can be used to report the number of reads that span the
 * fusion junction. This is used at the TranscriptSegment level, as it
 * indicates the transcript where the longer segment of the read is found
 */
export interface AnchoredReads {
  type?: "AnchoredReads";
  reads: number;
  [k: string]: unknown;
}
/**
 * Define Gene Element class.
 */
export interface GeneElement {
  type?: "GeneElement";
  gene: MappableConcept;
}
/**
 * Define TemplatedSequenceElement class.
 *
 * A templated sequence is a contiguous genomic sequence found in the gene
 * product.
 */
export interface TemplatedSequenceElement {
  type?: "TemplatedSequenceElement";
  region: SequenceLocation;
  strand: Strand;
}
/**
 * Define LinkerElement class (linker sequence)
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
   * The 'logical' identifier of the Entity in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * MUST be "LiteralSequenceExpression"
   */
  type?: "LiteralSequenceExpression";
  /**
   * A primary name for the entity.
   */
  name?: string | null;
  /**
   * A free-text description of the Entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  aliases?: string[] | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  sequence: SequenceString1;
}
/**
 * Define UnknownGene class.
 *
 * This is primarily intended to represent a
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
 * Define ContigSequence class.
 *
 * This class models the assembled contig sequence that supports the reported fusion
 * event
 */
export interface ContigSequence {
  type?: "ContigSequence";
  contig: string;
  [k: string]: unknown;
}
/**
 * Define ReadData class.
 *
 * This class is used at the AssayedFusion level when a fusion caller reports
 * metadata describing sequencing reads for the fusion event
 */
export interface ReadData {
  type?: "ReadData";
  split?: SplitReads | null;
  spanning?: SpanningReads | null;
  [k: string]: unknown;
}
/**
 * Define SplitReads class.
 *
 * This class models the number of reads that cover the junction bewteen the
 * detected partners in the fusion
 */
export interface SplitReads {
  type?: "SplitReads";
  splitReads: number;
  [k: string]: unknown;
}
/**
 * Define SpanningReads class.
 *
 * This class models the number of pairs of reads that support the reported fusion
 * event
 */
export interface SpanningReads {
  type?: "SpanningReads";
  spanningReads: number;
  [k: string]: unknown;
}
/**
 * Define causative event information for a fusion.
 *
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
 * Response model for domain ID autocomplete suggestion endpoint.
 */
export interface AssociatedDomainResponse {
  warnings?: string[] | null;
  gene_id: string;
  suggestions?: DomainParams[] | null;
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
  regulatoryElement?: RegulatoryElement | null;
  structure: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | MultiplePossibleGenesElement
  )[];
  fivePrimeJunction?: string | null;
  threePrimeJunction?: string | null;
  readingFramePreserved?: boolean | null;
  type?: "CategoricalFusion";
  viccNomenclature?: string | null;
  criticalFunctionalDomains?: FunctionalDomain[] | null;
  extensions?: Extension[] | null;
}
/**
 * Define MultiplePossibleGenesElement class.
 *
 * This is primarily intended to
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
  associatedGene: MappableConcept;
  id: string | null;
  label?: string | null;
  sequenceLocation?: SequenceLocation | null;
}
/**
 * Assayed fusion with client-oriented structural element models. Used in
 * global FusionContext.
 */
export interface ClientAssayedFusion {
  regulatoryElement?: ClientRegulatoryElement | null;
  structure: (
    | ClientTranscriptSegmentElement
    | ClientGeneElement
    | ClientTemplatedSequenceElement
    | ClientLinkerElement
    | ClientUnknownGeneElement
  )[];
  fivePrimeJunction?: string | null;
  threePrimeJunction?: string | null;
  readingFramePreserved?: boolean | null;
  type?: "AssayedFusion";
  viccNomenclature?: string | null;
  causativeEvent?: CausativeEvent | null;
  assay?: Assay | null;
  contig?: ContigSequence | null;
  readData?: ReadData | null;
}
/**
 * Define regulatory element object used client-side.
 */
export interface ClientRegulatoryElement {
  elementId: string;
  nomenclature: string;
  type?: "RegulatoryElement";
  regulatoryClass: RegulatoryClass;
  featureId?: string | null;
  associatedGene?: MappableConcept | null;
  featureLocation?: GenomicLocation | null;
  displayClass: string;
}
/**
 * TranscriptSegment element class used client-side.
 */
export interface ClientTranscriptSegmentElement {
  elementId: string;
  nomenclature: string;
  type?: "TranscriptSegmentElement";
  transcript: string;
  transcriptStatus: TranscriptPriority;
  strand: Strand;
  exonStart?: number | null;
  exonStartOffset?: number | null;
  exonEnd?: number | null;
  exonEndOffset?: number | null;
  gene: MappableConcept;
  elementGenomicStart?: SequenceLocation | null;
  elementGenomicEnd?: SequenceLocation | null;
  coverage?: BreakpointCoverage | null;
  anchoredReads?: AnchoredReads | null;
  inputType: "genomic_coords" | "exon_coords";
  inputTx?: string | null;
  inputStrand?: Strand | null;
  inputGene?: string | null;
  inputChr?: string | null;
  inputGenomicStart?: string | null;
  inputGenomicEnd?: string | null;
  inputExonStart?: string | null;
  inputExonStartOffset?: string | null;
  inputExonEnd?: string | null;
  inputExonEndOffset?: string | null;
}
/**
 * Gene element used client-side.
 */
export interface ClientGeneElement {
  elementId: string;
  nomenclature: string;
  type?: "GeneElement";
  gene: MappableConcept;
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
  regulatoryElement?: ClientRegulatoryElement | null;
  structure: (
    | ClientTranscriptSegmentElement
    | ClientGeneElement
    | ClientTemplatedSequenceElement
    | ClientLinkerElement
    | ClientMultiplePossibleGenesElement
  )[];
  fivePrimeJunction?: string | null;
  threePrimeJunction?: string | null;
  readingFramePreserved?: boolean | null;
  type?: "CategoricalFusion";
  viccNomenclature?: string | null;
  criticalFunctionalDomains: ClientFunctionalDomain[] | null;
  extensions?: Extension[] | null;
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
  associatedGene: MappableConcept;
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
  warnings?: string[] | null;
  coordinates_data: GenomicTxSegService | null;
}
/**
 * Service model for genomic and transcript data.
 */
export interface GenomicTxSegService {
  /**
   * Valid, case-sensitive HGNC gene symbol.
   */
  gene?: string | null;
  /**
   * RefSeq genomic accession.
   */
  genomic_ac?: string | null;
  /**
   * RefSeq transcript accession.
   */
  tx_ac?: string | null;
  /**
   * Transcript priority for RefSeq transcript accession
   */
  tx_status?: TranscriptPriority | null;
  /**
   * The strand that the transcript exists on.
   */
  strand?: Strand | null;
  /**
   * Start transcript segment.
   */
  seg_start?: TxSegment | null;
  /**
   * End transcript segment.
   */
  seg_end?: TxSegment | null;
  /**
   * Error messages.
   */
  errors?: string[];
  service_meta: ServiceMeta;
}
/**
 * Model for representing transcript segment data.
 */
export interface TxSegment {
  /**
   * Exon number. 0-based.
   */
  exon_ord: number;
  /**
   * The value added to or subtracted from the `genomic_location` to find the start or end of an exon.
   */
  offset?: number;
  genomic_location: SequenceLocation1;
}
/**
 * A `Location` defined by an interval on a `Sequence`.
 */
export interface SequenceLocation1 {
  /**
   * The 'logical' identifier of the Entity in the system of record, e.g. a UUID.  This 'id' is unique within a given system, but may or may not be globally unique outside the system. It is used within a system to reference an object from another.
   */
  id?: string | null;
  /**
   * MUST be "SequenceLocation"
   */
  type?: "SequenceLocation";
  /**
   * A primary name for the entity.
   */
  name?: string | null;
  /**
   * A free-text description of the Entity.
   */
  description?: string | null;
  /**
   * Alternative name(s) for the Entity.
   */
  aliases?: string[] | null;
  /**
   * A list of extensions to the Entity, that allow for capture of information not directly supported by elements defined in the model.
   */
  extensions?: Extension[] | null;
  /**
   * A sha512t24u digest created using the VRS Computed Identifier algorithm.
   */
  digest?: string | null;
  /**
   * A reference to a SequenceReference on which the location is defined.
   */
  sequenceReference?: IriReference | SequenceReference | null;
  /**
   * The start coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. For locations on linear sequences, this MUST represent a coordinate or range less than or equal to the value of `end`. For circular sequences, `start` is greater than `end` when the location spans the sequence 0 coordinate.
   */
  start?: Range | number | null;
  /**
   * The end coordinate or range of the SequenceLocation. The minimum value of this coordinate or range is 0. For locations on linear sequences, this MUST represent a coordinate or range greater than or equal to the value of `start`. For circular sequences, `end` is less than `start` when the location spans the sequence 0 coordinate.
   */
  end?: Range | number | null;
  /**
   * The literal sequence encoded by the `sequenceReference` at these coordinates.
   */
  sequence?: SequenceString | null;
}
/**
 * Service metadata.
 */
export interface ServiceMeta {
  name?: "cool_seq_tool";
  version: string;
  response_datetime: string;
  url?: "https://github.com/GenomicMedLab/cool-seq-tool";
}
/**
 * Response model for demo fusion object retrieval endpoints.
 */
export interface DemoResponse {
  warnings?: string[] | null;
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
 * Assayed fusion with parameters defined as expected in fusor assayed_fusion function
 * validate attempts to validate a fusion by constructing it by sending kwargs. In the models and frontend, these are camelCase,
 * but the assayed_fusion and categorical_fusion constructors expect snake_case
 */
export interface FormattedAssayedFusion {
  fusion_type?: AssayedFusion1;
  structure: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | UnknownGeneElement
    | ContigSequence
    | ReadData
  )[];
  causative_event?: CausativeEvent | null;
  assay?: Assay | null;
  regulatory_element?: RegulatoryElement | null;
  reading_frame_preserved?: boolean | null;
}
/**
 * Categorical fusion with parameters defined as expected in fusor categorical_fusion function
 * validate attempts to validate a fusion by constructing it by sending kwargs. In the models and frontend, these are camelCase,
 * but the assayed_fusion and categorical_fusion constructors expect snake_case
 */
export interface FormattedCategoricalFusion {
  fusion_type?: CategoricalFusion1;
  structure: (
    | TranscriptSegmentElement
    | GeneElement
    | TemplatedSequenceElement
    | LinkerElement
    | MultiplePossibleGenesElement
  )[];
  regulatory_element?: RegulatoryElement | null;
  critical_functional_domains?: FunctionalDomain[] | null;
  reading_frame_preserved?: boolean | null;
}
/**
 * Response model for gene element construction endoint.
 */
export interface GeneElementResponse {
  warnings?: string[] | null;
  element: GeneElement | null;
}
/**
 * Response model for functional domain constructor endpoint.
 */
export interface GetDomainResponse {
  warnings?: string[] | null;
  domain: FunctionalDomain | null;
}
/**
 * Response model for retrieving list of transcripts for a given gene
 */
export interface GetGeneTranscriptsResponse {
  warnings?: string[] | null;
  transcripts?: string[];
}
/**
 * Response model for MANE transcript retrieval endpoint.
 */
export interface GetTranscriptsResponse {
  warnings?: string[] | null;
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
  chr_start: number;
  chr_end: number;
  chr_strand: string;
}
/**
 * Response model for regulatory element nomenclature endpoint.
 */
export interface NomenclatureResponse {
  warnings?: string[] | null;
  nomenclature: string | null;
}
/**
 * Response model for gene normalization endpoint.
 */
export interface NormalizeGeneResponse {
  warnings?: string[] | null;
  term: string;
  concept_id: string | null;
  symbol: string | null;
  cased: string | null;
}
/**
 * Response model for regulatory element constructor.
 */
export interface RegulatoryElementResponse {
  warnings?: string[] | null;
  regulatoryElement: RegulatoryElement | null;
}
/**
 * Abstract Response class for defining API response structures.
 */
export interface Response {
  warnings?: string[] | null;
}
/**
 * Response model for sequence ID retrieval endpoint.
 */
export interface SequenceIDResponse {
  warnings?: string[] | null;
  sequence: string;
  refseq_id?: string | null;
  ga4gh_id?: string | null;
  aliases?: string[] | null;
}
/**
 * Response model for service_info endpoint.
 */
export interface ServiceInfoResponse {
  warnings?: string[] | null;
  fusion_builder_version: string;
  fusor_version: string;
  cool_seq_tool_version: string;
}
/**
 * Response model for gene autocomplete suggestions endpoint.
 */
export interface SuggestGeneResponse {
  warnings?: string[] | null;
  term: string;
  matches_count: number;
  concept_id: [unknown, unknown, unknown, unknown, unknown][] | null;
  symbol: [unknown, unknown, unknown, unknown, unknown][] | null;
  prev_symbols: [unknown, unknown, unknown, unknown, unknown][] | null;
  aliases: [unknown, unknown, unknown, unknown, unknown][] | null;
}
/**
 * Response model for transcript segment element construction endpoint.
 */
export interface TemplatedSequenceElementResponse {
  warnings?: string[] | null;
  element: TemplatedSequenceElement | null;
}
/**
 * Response model for transcript segment element construction endpoint.
 */
export interface TxSegmentElementResponse {
  warnings?: string[] | null;
  element: TranscriptSegmentElement | null;
}
/**
 * Response model for Fusion validation endpoint.
 */
export interface ValidateFusionResponse {
  warnings?: string[] | null;
  fusion?: CategoricalFusion | AssayedFusion | null;
}
