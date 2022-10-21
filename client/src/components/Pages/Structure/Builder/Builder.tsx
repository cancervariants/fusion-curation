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
import { Box } from "@material-ui/core";
import { MARGIN_OFFSETS } from "../../../../global/styles/theme";

const EDITABLE_ELEMENT_TYPES = [
  ElementType.geneElement,
  ElementType.templatedSequenceElement,
  ElementType.linkerSequenceElement,
  ElementType.transcriptSegmentElement,
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

  console.log(fusion.structural_elements)

  // drop new element into structure
  const createNew = (result: DropResult) => {
    const { source, destination } = result;
    const sourceClone = Array.from(ELEMENT_TEMPLATE);
    const destClone = Array.from(fusion.structural_elements);
    const item = sourceClone[source.index];
    const newItem = Object.assign({}, item);
    newItem.element_id = uuid();
    destClone.splice(destination.index, 0, newItem);
    setFusion({ ...fusion, ...{ structural_elements: destClone } });

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
    },
    TranscriptSegmentElement: {
      name: "Transcript Segment",
      icon: (
        <>
          <ContrastIcon />
        </>
      ),
    },
    LinkerSequenceElement: {
      name: "Linker Sequence",
      icon: (
        <>
          <LinkIcon />
        </>
      ),
    },
    TemplatedSequenceElement: {
      name: "Templated Sequence",
      icon: (
        <>
          <BlurCircularOutlinedIcon />
        </>
      ),
    },
    MultiplePossibleGenesElement: {
      name: "Multiple Possible Genes",
      icon: (
        <>
          <WorkspacesIcon />
        </>
      ),
    },
    UnknownGeneElement: {
      name: "Unknown Gene",
      icon: (
        <>
          <HelpIcon />
        </>
      ),
    },
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    console.log(destination)
    console.log(source)
    if (!destination) return; // dropped outside the list
    if (destination.droppableId === source.droppableId) {
      reorder(result);
    } else {
      createNew(result);
    }
  };

  const nomenclatureContent = fusion.structural_elements
    .filter(
      (element: ClientElementUnion) => Boolean(element) && element.nomenclature
    )
    .map(
      (element: ClientElementUnion, index: number) =>
        `${index ? "::" : ""}${element.nomenclature}`
    );

  const nomenclatureElement = (
    <Box className="hr-section" py={1} minHeight="35px">
      {nomenclatureContent}
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
                          draggableId={element_id}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            return (
                              <React.Fragment>
                                <Box
                                  ref={provided.innerRef}
                                  className={`option-item ${type}`}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? provided.draggableProps.style?.transform
                                      : "translate(0px, 0px)",
                                  }}
                                >
                                  {elementNameMap[type].icon}{" "}
                                  <Box ml="8px">
                                    {elementNameMap[type].name}
                                  </Box>
                                </Box>
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
                      fusion.structural_elements?.length === 0
                        ? "instruction"
                        : "hidden"
                    }`}
                  >
                    Drag elements here
                  </h2>
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
