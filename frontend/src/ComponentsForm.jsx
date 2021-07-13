import { React, useCallback } from 'react';
import { Box, FormLabel } from '@material-ui/core';
import update from 'immutability-helper';
import ComponentsCard from './ComponentsCard';
import AddComponentButton from './AddComponentButton';

const style = {
  // width: 800, // TODO much more
};

const ComponentsForm = ({ components, setComponents }) => {
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    const dragCard = components[dragIndex];
    setComponents(update(components, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragCard],
      ],
    }));
  }, [components]);

  const handleComponentChange = (cardID, field, newValue) => {
    const componentsCopy = components.slice();
    const cardIndex = componentsCopy.findIndex((c) => c.id === cardID);
    // TODO handle # results != 0
    if (field === 'componentType') {
      componentsCopy[cardIndex].componentType = newValue;
    } else {
      componentsCopy[cardIndex].componentValues[field] = newValue;
    }
    setComponents(componentsCopy);
  };

  const deleteCard = (cardID) => {
    const index = components.map((component) => component.id).indexOf(cardID);
    const copy = [...components];
    copy.splice(index, 1);
    setComponents(copy);
  };

  const renderCard = (card, index) => (
    <ComponentsCard
      key={card.id}
      index={index}
      id={card.id}
      moveCard={moveCard}
      componentType={card.componentType}
      componentValues={card.componentValues}
      handleCardChange={(field, newValue) => handleComponentChange(card.id, field, newValue)}
      deleteCard={() => deleteCard(card.id)}
    />
  );

  const handleAddClick = (componentType) => {
    const newCard = {
      id: components.length === 0 ? 1 : Math.max(...components.map((c) => c.id)) + 1,
      componentType,
      componentValues: {},
    };

    setComponents((prevCards) => [...prevCards, newCard]);
  };

  return (
    <Box p={1}>
      <FormLabel component="legend">
        Enter chimeric transcript components:
      </FormLabel>
      {components.length === 0
        ? <p />
        : null}
      <div style={style}>{components.map((card, i) => renderCard(card, i))}</div>
      <AddComponentButton clickHandler={handleAddClick} />
      <p />
    </Box>
  );
};

export default ComponentsForm;
