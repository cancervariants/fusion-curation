// core components
import React, { useContext, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { v4 as uuid } from "uuid";
// global fusion
import { FusionContext } from "../../../../global/contexts/FusionContext";
// elements
import { ClientElementUnion, ElementType } from "../../../../services/main";
import {
  ClientMultiplePossibleGenesElement,
  ClientUnknownGeneElement,
} from "../../../../services/ResponseModels";
import GeneElementInput from "../Input/GeneElementInput/GeneElementInput";
import LinkerElementInput from "../Input/LinkerElementInput/LinkerElementInput";
import StaticElement from "../Input/StaticElement/StaticElement";
import TemplatedSequenceElementInput from "../Input/TemplatedSequenceElementInput/TemplatedSequenceElementInput";
import TxSegmentElementInput from "../Input/TxSegmentElementInput/TxSegmentElementInput";
// style
import "./Builder.scss";
import BlurCircularOutlinedIcon from "@mui/icons-material/BlurCircularOutlined";
import StarsIcon from "@mui/icons-material/Stars";
import ContrastIcon from "@mui/icons-material/Contrast";
import HelpIcon from "@mui/icons-material/Help";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import LinkIcon from "@mui/icons-material/Link";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import RegulatoryElementInput from "../Input/RegulatoryElementInput/RegulatoryElementInput";
import { Box, Divider, Typography } from "@material-ui/core";
import { MARGIN_OFFSETS } from "../../../../global/styles/theme";
import HelpTooltip from "../../../main/shared/HelpTooltip/HelpTooltip";

const EDITABLE_ELEMENT_TYPES = [
  ElementType.geneElement,
  ElementType.templatedSequenceElement,
  ElementType.linkerSequenceElement,
  ElementType.transcriptSegmentElement,
  ElementType.regulatoryElement,
];

const STATIC_ELEMENT_TYPES = [
  ElementType.multiplePossibleGenesElement,
  ElementType.unknownGeneElement,
];

// these are the empty object templates the user drags into the array
// TODO: should be dynamic (?)
const ELEMENT_TEMPLATE = [
  {
    type: ElementType.geneElement,
    nomenclature: "",
    element_id: uuid(),
    gene_descriptor: {
      id: "",
      type: "",
      gene_id: "",
      label: "",
    },
  },
  {
    type: ElementType.transcriptSegmentElement,
    nomenclature: "",
    element_id: uuid(),
    exon_start: null,
    exon_start_offset: null,
    exon_end: null,
    exon_end_offset: null,
    gene_descriptor: {
      id: "",
      gene_id: "",
      type: "",
      label: "",
    },
  },
  {
    nomenclature: "",
    type: ElementType.linkerSequenceElement,
    element_id: uuid(),
  },
  {
    nomenclature: "",
    type: ElementType.templatedSequenceElement,
    element_id: uuid(),
    id: "",
    location: {
      sequence_id: "",
      type: "",
      interval: {
        start: {
          type: "",
          value: null,
        },
        end: {
          type: "",
          value: null,
        },
        type: "",
      },
    },
  },
  {
    type: ElementType.unknownGeneElement,
    element_id: uuid(),
    nomenclature: "?",
  },
  {
    type: ElementType.multiplePossibleGenesElement,
    element_id: uuid(),
    nomenclature: "v",
  },
  {
    type: ElementType.regulatoryElement,
    nomenclature: "",
    element_id: uuid(),
  },
];

const Builder: React.FC = () => {
  // Fusion object constructed throughout app lifecycle
  const { fusion, setFusion } = useContext(FusionContext);
  // calculate window width and rerender component upon window resize for proper styling
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const setWindowDimensions = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", setWindowDimensions);
    return () => {
      window.removeEventListener("resize", setWindowDimensions);
    };
  }, []);

  useEffect(() => {
    if (!("structural_elements" in fusion)) {
      setFusion({
        ...fusion,
        ...{ structural_elements: [] },
      });
    }
  }, [fusion]);

  // drop new element into structure
  const createNew = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    const sourceClone = Array.from(ELEMENT_TEMPLATE);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.element_id = uuid();

    if (draggableId.includes("RegulatoryElement")) {
      setFusion({ ...fusion, ...{ regulatory_element: newItem } });
    } else {
      const destClone = Array.from(fusion.structural_elements);
      destClone.splice(destination.index, 0, newItem);
      setFusion({ ...fusion, ...{ structural_elements: destClone } });
    }

    // auto-save elements that don't need any additional input
    // TODO shouldn't need explicit autosave
    if (STATIC_ELEMENT_TYPES.includes(newItem.type)) {
      handleSave(
        destination.index,
        newItem as ClientMultiplePossibleGenesElement | ClientUnknownGeneElement
      );
    }
  };

  const reorder = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(fusion.structural_elements);
    const [movedElement] = sourceClone.splice(source.index, 1);
    sourceClone.splice(destination.index, 0, movedElement);
    setFusion({ ...fusion, ...{ structural_elements: sourceClone } });
  };

  // Update global fusion object
  const handleSave = (index: number, newElement: ClientElementUnion) => {
    const items = Array.from(fusion.structural_elements);
    const spliceLength = EDITABLE_ELEMENT_TYPES.includes(
      newElement.type as ElementType
    )
      ? 1
      : 0;
    items.splice(index, spliceLength, newElement);
    setFusion({ ...fusion, ...{ structural_elements: items } });
  };

  const handleDelete = (uuid: string) => {
    let items: Array<ClientElementUnion> = Array.from(
      fusion.structural_elements
    );
    items = items.filter((item) => item?.element_id !== uuid);
    setFusion({ ...fusion, ...{ structural_elements: items } });
  };

  const elementNameMap = {
    GeneElement: {
      name: "Gene",
      icon: (
        <>
          <StarsIcon />
        </>
      ),
      tooltip: (
        <>
          <Typography>
            A gene may be used as a structural element, in which case it refers
            to an unspecified transcript of that gene.
          </Typography>
          <Typography>
            {fusion.type === "CategoricalFusion"
              ? "For Categorical Gene Fusions, this means any transcript meeting other parameters of the specified fusion."
              : "For Assayed Gene Fusions, this means that the exact transcript is not known."}
          </Typography>
        </>
      ),
    },
    TranscriptSegmentElement: {
      name: "Transcript Segment",
      icon: (
        <>
          <ContrastIcon />
        </>
      ),
      tooltip: (
        <Typography>
          A transcript segment is a representation of a transcribed sequence
          denoted by a 5&#39; and 3&#39; segment boundary. Typically, transcript
          segments are used when the gene fusion junction boundary is known or
          when representing full-length Chimeric Transcript Fusions.
        </Typography>
      ),
    },
    LinkerSequenceElement: {
      name: "Linker Sequence",
      icon: (
        <>
          <LinkIcon />
        </>
      ),
      tooltip: (
        <Typography>
          A linker sequence is an observed sequence in the gene fusion that
          typically occurs between transcript segments, and where the sequence
          origin is unknown or ambiguous. In cases where the linker sequence is
          a known intronic or intergenic region, it should be represented as a
          Templated Sequence instead.
        </Typography>
      ),
    },
    TemplatedSequenceElement: {
      name: "Templated Sequence",
      icon: (
        <>
          <BlurCircularOutlinedIcon />
        </>
      ),
      tooltip: (
        <Typography>
          A templated linker sequence is an observed sequence in the gene fusion
          that typically occurs between transcript segments, and where the
          sequence origin is a known intronic or intergenic region.
        </Typography>
      ),
    },
    MultiplePossibleGenesElement: {
      name: "Multiple Possible Genes",
      icon: (
        <>
          <WorkspacesIcon />
        </>
      ),
      tooltip: (
        <Typography>
          This element represents a a partner in a fusion which typifies
          generalizable characteristics of a class of fusions such as retained
          or lost functional domains, often curated from biomedical literature
          for use in genomic knowledgebases.
        </Typography>
      ),
    },
    UnknownGeneElement: {
      name: "Unknown Gene",
      icon: (
        <>
          <HelpIcon />
        </>
      ),
      tooltip: (
        <Typography>
          This element represents the unknown partner in the result of a fusion
          partner-agnostic assay, which identifies the absence of an expected
          gene.
        </Typography>
      ),
    },
    RegulatoryElement: {
      name: "Regulatory Element",
      icon: (
        <>
          <AutorenewIcon />
        </>
      ),
      tooltip: (
        <Typography>
          Regulatory elements include a Regulatory Feature used to describe an
          enhancer, promoter, or other regulatory elements that constitute
          Regulatory Fusions. Regulatory features may also be defined by a gene
          with which the feature is associated (e.g. an IGH-associated enhancer
          element).
        </Typography>
      ),
    },
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (
      destination &&
      destination.droppableId === source.droppableId &&
      !draggableId.includes("RegulatoryElement")
    ) {
      reorder(result);
    } else {
      createNew(result);
    }
  };

  const nomenclatureParts = fusion.structural_elements
    .filter(
      (element: ClientElementUnion) => Boolean(element) && element.nomenclature
    )
    .map((element: ClientElementUnion) => element.nomenclature);

  if (fusion.regulatory_element && fusion.regulatory_element.nomenclature) {
    nomenclatureParts.unshift(fusion.regulatory_element.nomenclature);
  }
  const nomenclature = nomenclatureParts.map(
    (nom: string, index: number) => `${index ? "::" : ""}${nom}`
  );

  const nomenclatureElement = (
    <Box className="hr-section" minHeight="30px">
      {nomenclature}
    </Box>
  );

  const renderElement = (element: ClientElementUnion, index: number) => {
    switch (element.type) {
      case ElementType.geneElement:
        return (
          <GeneElementInput
            icon={elementNameMap[ElementType.geneElement].icon}
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case ElementType.linkerSequenceElement:
        return (
          <LinkerElementInput
            icon={elementNameMap[ElementType.linkerSequenceElement].icon}
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case ElementType.templatedSequenceElement:
        return (
          <TemplatedSequenceElementInput
            icon={elementNameMap[ElementType.templatedSequenceElement].icon}
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case ElementType.transcriptSegmentElement:
        return (
          <TxSegmentElementInput
            icon={elementNameMap[ElementType.transcriptSegmentElement].icon}
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case ElementType.multiplePossibleGenesElement:
        return (
          <StaticElement
            icon={elementNameMap[ElementType.multiplePossibleGenesElement].icon}
            {...{ element, index, handleDelete }}
          />
        );
      case ElementType.unknownGeneElement:
        return (
          <StaticElement
            icon={elementNameMap[ElementType.unknownGeneElement].icon}
            {...{ element, index, handleDelete }}
          />
        );
      case ElementType.regulatoryElement:
        return (
          <RegulatoryElementInput
            icon={elementNameMap[ElementType.regulatoryElement].icon}
            {...{ element, index, handleSave }}
          />
        );
    }
  };

  return (
    <Box className="builder">
      {nomenclatureElement}
      <Box className="drag-and-drop-section" display="flex">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="OPTIONS" isDropDisabled={true}>
            {(provided) => (
              <Box
                className="options"
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ display: "flex" }}
              >
                <Box className="options-container">
                  {ELEMENT_TEMPLATE.map(({ element_id, type }, index) => {
                    if (
                      (fusion.type === "AssayedFusion" &&
                        type !== ElementType.multiplePossibleGenesElement) ||
                      (fusion.type === "CategoricalFusion" &&
                        type !== ElementType.unknownGeneElement)
                    ) {
                      return (
                        <Draggable
                          key={element_id}
                          draggableId={type + element_id}
                          index={index}
                          isDragDisabled={
                            type === ElementType.regulatoryElement &&
                            fusion.regulatory_element !== undefined
                          }
                        >
                          {(provided, snapshot) => {
                            return (
                              <React.Fragment>
                                <HelpTooltip
                                  placement="right"
                                  title={elementNameMap[type].tooltip}
                                >
                                  <Box
                                    ref={provided.innerRef}
                                    className={
                                      "option-item" +
                                      (type === ElementType.regulatoryElement &&
                                      fusion.regulatory_element !== undefined
                                        ? " disabled_reg_element"
                                        : "")
                                    }
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transform: snapshot.isDragging
                                        ? provided.draggableProps.style
                                            ?.transform
                                        : "translate(0px, 0px)",
                                    }}
                                  >
                                    {elementNameMap[type].icon}{" "}
                                    <Box ml="8px">
                                      {elementNameMap[type].name}
                                    </Box>
                                  </Box>
                                </HelpTooltip>
                                {snapshot.isDragging && (
                                  <Box
                                    style={{ transform: "none !important" }}
                                    key={element_id}
                                    className={`option-item clone ${type}`}
                                  >
                                    {elementNameMap[type].icon}{" "}
                                    <Box ml="8px">
                                      {elementNameMap[type].name}
                                    </Box>
                                  </Box>
                                )}
                              </React.Fragment>
                            );
                          }}
                        </Draggable>
                      );
                    }
                  })}
                </Box>
              </Box>
            )}
          </Droppable>
          <Box
            className="right-side"
            maxWidth={windowWidth - MARGIN_OFFSETS.structureBlocks}
          >
            <Droppable droppableId="structure" direction="horizontal">
              {(provided) => (
                <Box
                  className="block-container"
                  maxWidth={windowWidth - MARGIN_OFFSETS.structureBlocks}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h2
                    className={`${
                      fusion.structural_elements?.length === 0 &&
                      !fusion.regulatory_element
                        ? "instruction"
                        : "hidden"
                    }`}
                  >
                    Drag elements here
                  </h2>
                  {fusion.regulatory_element && (
                    <>
                      <Box
                        className={`block ${fusion?.regulatory_element?.type}`}
                      >
                        {renderElement(fusion?.regulatory_element, 0)}
                      </Box>
                      <Divider
                        orientation="vertical"
                        style={{ width: "2px" }}
                      />
                    </>
                  )}
                  {fusion.structural_elements?.map(
                    (element: ClientElementUnion, index: number) => {
                      return (
                        element && (
                          <Draggable
                            key={element.element_id}
                            draggableId={element.element_id}
                            index={index}
                          >
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                className={`block ${element.type}`}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {renderElement(element, index)}
                              </Box>
                            )}
                          </Draggable>
                        )
                      );
                    }
                  )}
                </Box>
              )}
            </Droppable>
          </Box>
        </DragDropContext>
      </Box>
    </Box>
  );
};

export default Builder;
