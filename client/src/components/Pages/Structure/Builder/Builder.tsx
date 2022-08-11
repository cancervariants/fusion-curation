// core components
import React, { useContext, useEffect } from "react";
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
import { ClientElementUnion } from "../../../../services/main";
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

const EDITABLE_ELEMENT_TYPES = [
  "GeneElement",
  "LinkerSequenceElement",
  "TemplatedSequenceElement",
  "TranscriptSegmentElement",
];

// these are the empty object templates the user drags into the array
// TODO: should be dynamic (?)
const ELEMENT_TEMPLATE = [
  {
    type: "GeneElement",
    element_name: "",
    element_id: uuid(),
    gene_descriptor: {
      id: "",
      type: "",
      gene_id: "",
      label: "",
    },
  },
  {
    type: "TranscriptSegmentElement",
    element_name: "",
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
    element_name: "",
    type: "LinkerSequenceElement",
    element_id: uuid(),
  },
  {
    element_name: "",
    type: "TemplatedSequenceElement",
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
    element_name: "?",
    type: "UnknownGeneElement",
    element_id: uuid(),
    hr_name: "?",
  },
  {
    element_name: "v",
    type: "MultiplePossibleGenesElement",
    element_id: uuid(),
    hr_name: "v",
  },
];

const Builder: React.FC = () => {
  // Fusion object constructed throughout app lifecycle
  const { fusion, setFusion } = useContext(FusionContext);

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
    if (["AnyGeneElement", "UnknownGeneElement"].includes(newItem.type)) {
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
    const spliceLength = EDITABLE_ELEMENT_TYPES.includes(newElement.type)
      ? 1
      : 0;
    items.splice(index, spliceLength, newElement);
    setFusion({ ...fusion, ...{ structural_elements: items } });
  };

  const handleDelete = (uuid: string) => {
    let items: Array<ClientElementUnion> = Array.from(
      fusion.structural_elements
    );
    items = items.filter((item) => item.element_id !== uuid);
    setFusion({ ...fusion, ...{ structural_elements: items } });
  };

  const elementNameMap = {
    GeneElement: "Gene",
    TranscriptSegmentElement: "Transcript Segment",
    LinkerSequenceElement: "Linker Sequence",
    TemplatedSequenceElement: "Templated Sequence",
    MultiplePossibleGenesElement: "Multiple Possible Genes",
    UnknownGeneElement: "Unknown Gene",
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // dropped outside the list
    if (destination.droppableId === source.droppableId) {
      reorder(result);
    } else {
      createNew(result);
    }
  };

  const renderElement = (element: ClientElementUnion, index: number) => {
    switch (element.type) {
      case "GeneElement":
        return (
          <GeneElementInput {...{ element, index, handleDelete, handleSave }} />
        );
      case "LinkerSequenceElement":
        return (
          <LinkerElementInput
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case "TemplatedSequenceElement":
        return (
          <TemplatedSequenceElementInput
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case "TranscriptSegmentElement":
        return (
          <TxSegmentElementInput
            {...{ element, index, handleDelete, handleSave }}
          />
        );
      case "MultiplePossibleGenesElement":
      case "UnknownGeneElement":
        return <StaticElement {...{ element, index, handleDelete }} />;
    }
  };

  return (
    <div className="builder">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="OPTIONS" isDropDisabled={true}>
          {(provided) => (
            <div
              className="options"
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{display: "flex" }}
            >
              <div className="options-container">
                {ELEMENT_TEMPLATE.map(({ element_id, type }, index) => {
                  if (
                    (fusion.type === "AssayedFusion" &&
                      type !== "MultiplePossibleGenesElement") ||
                    (fusion.type === "CategoricalFusion" &&
                      type !== "UnknownGeneElement")
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
                              <div
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
                                {elementNameMap[type]}
                              </div>
                              {snapshot.isDragging && (
                                <div
                                  style={{ transform: "none !important" }}
                                  key={element_id}
                                  className={`option-item clone ${type}`}
                                >
                                  {elementNameMap[type]}
                                </div>
                              )}
                            </React.Fragment>
                          );
                        }}
                      </Draggable>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </Droppable>
        <div className="right-side">
          <Droppable droppableId="structure">
            {(provided) => (
              <div
                className="block-container"
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
                      <Draggable
                        key={element.element_id}
                        draggableId={element.element_id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            className={`block ${element.type}`}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {renderElement(element, index)}
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                )}
              </div>
            )}
          </Droppable>
          <div className="hr-section">
            {fusion.structural_elements
              ?.filter(
                (element: ClientElementUnion) =>
                  Boolean(element) && element.hr_name
              )
              .map((element: ClientElementUnion, index: number) => (
                <div key={element.element_id}>{`${index ? "::" : ""}${
                  element.hr_name
                }`}</div>
              ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Builder;
