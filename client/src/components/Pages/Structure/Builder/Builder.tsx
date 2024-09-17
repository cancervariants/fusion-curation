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
    elementId: uuid(),
    gene: {
      id: "",
      type: "",
      label: "",
    },
  },
  {
    type: ElementType.transcriptSegmentElement,
    nomenclature: "",
    elementId: uuid(),
    exonStart: null,
    exonStartOffset: null,
    exonEnd: null,
    exonEndOffset: null,
    gene: {
      id: "",
      type: "",
      label: "",
    },
  },
  {
    nomenclature: "",
    type: ElementType.linkerSequenceElement,
    elementId: uuid(),
  },
  {
    nomenclature: "",
    type: ElementType.templatedSequenceElement,
    elementId: uuid(),
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
    elementId: uuid(),
    nomenclature: "?",
  },
  {
    type: ElementType.multiplePossibleGenesElement,
    elementId: uuid(),
    nomenclature: "v",
  },
  {
    type: ElementType.regulatoryElement,
    nomenclature: "",
    elementId: uuid(),
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
    if (!("structure" in fusion)) {
      setFusion({
        ...fusion,
        ...{ structure: [] },
      });
    }
  }, [fusion]);

  // drop new element into structure
  const createNew = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    const sourceClone = Array.from(ELEMENT_TEMPLATE);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.elementId = uuid();

    if (draggableId.includes("RegulatoryElement")) {
      setFusion({ ...fusion, ...{ regulatoryElement: newItem } });
    } else {
      const destClone = Array.from(fusion.structure);
      destClone.splice(destination.index, 0, newItem);
      setFusion({ ...fusion, ...{ structure: destClone } });
    }

    // auto-save elements that don't need any additional input
    // TODO shouldn't need explicit autosave
    if (STATIC_ELEMENT_TYPES.includes(newItem.type)) {
      handleSave(
        newItem as ClientMultiplePossibleGenesElement | ClientUnknownGeneElement
      );
    }
  };

  const reorder = (result: DropResult) => {
    const { source, destination } = result;

    setFusion((prevFusion) => {
      const sourceClone = Array.from(prevFusion.structure);
      const [movedElement] = sourceClone.splice(source.index, 1);
      sourceClone.splice(destination.index, 0, movedElement);

      return { ...prevFusion, structure: sourceClone };
    });
  };

  // Update global fusion object
  const handleSave = (newElement: ClientElementUnion) => {
    setFusion((prevFusion) => {
      const updatedStructure = prevFusion.structure.map((item) =>
        item.elementId === newElement.elementId ? newElement : item
      );

      return { ...prevFusion, structure: updatedStructure };
    });
  };

  const handleDelete = (uuid: string) => {
    let items: Array<ClientElementUnion> = Array.from(fusion.structure);
    items = items.filter((item) => item?.elementId !== uuid);
    setFusion({ ...fusion, ...{ structure: items } });
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

  const nomenclatureParts = fusion.structure
    .filter(
      (element: ClientElementUnion) => Boolean(element) && element.nomenclature
    )
    .map((element: ClientElementUnion) => element.nomenclature);

  if (fusion.regulatoryElement && fusion.regulatoryElement.nomenclature) {
    nomenclatureParts.unshift(fusion.regulatoryElement.nomenclature);
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
                  {ELEMENT_TEMPLATE.map(({ elementId, type }, index) => {
                    if (
                      (fusion.type === "AssayedFusion" &&
                        type !== ElementType.multiplePossibleGenesElement) ||
                      (fusion.type === "CategoricalFusion" &&
                        type !== ElementType.unknownGeneElement)
                    ) {
                      return (
                        <Draggable
                          key={elementId}
                          draggableId={type + elementId}
                          index={index}
                          isDragDisabled={
                            type === ElementType.regulatoryElement &&
                            fusion.regulatoryElement !== undefined
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
                                      fusion.regulatoryElement !== undefined
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
                                    key={elementId}
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
                      fusion.structure?.length === 0 &&
                      !fusion.regulatoryElement
                        ? "instruction"
                        : "hidden"
                    }`}
                  >
                    Drag elements here
                  </h2>
                  {fusion.regulatoryElement && (
                    <>
                      <Box
                        className={`block ${fusion?.regulatoryElement?.type}`}
                      >
                        {renderElement(fusion?.regulatoryElement, 0)}
                      </Box>
                      <Divider
                        orientation="vertical"
                        style={{ width: "2px" }}
                      />
                    </>
                  )}
                  {fusion.structure?.map(
                    (element: ClientElementUnion, index: number) => {
                      return (
                        element && (
                          <Draggable
                            key={element.elementId}
                            draggableId={element.elementId}
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
