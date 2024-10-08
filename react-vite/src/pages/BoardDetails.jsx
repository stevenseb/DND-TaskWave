import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  getCardsByList,
  getCard,
  editCardById,
  deleteCardById,
  createCardTask,
  getAllCardTasks,
  editCardTaskById,
  deleteCardTaskById,
} from '../redux/card';
import { getBoard } from '../redux/board';
import { getListsByBoard } from '../redux/list';
import styles from './BoardDetails.module.css';
import Draggable from '../components/DND/Draggable';
import Droppable from '../components/DND/Droppable';
import { DndContext } from '@dnd-kit/core';

const BoardDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const cards = useSelector((state) => state.cards.allCardsByList);
  const lists = useSelector((state) => state.lists.allLists);
  const board = useSelector((state) => state.boards.currentBoard);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    dispatch(getBoard(id));
    dispatch(getListsByBoard(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (lists) {
      Object.keys(lists).forEach((listId) => {
        dispatch(getCardsByList(listId));
      });
    }
  }, [dispatch, lists]);

  const handleEditCard = (cardId) => {
    const updatedCardData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };
    dispatch(editCardById(cardId, updatedCardData));
  };

  const handleDeleteCard = (cardId) => {
    dispatch(deleteCardById(cardId));
  };

  const handleCreateCardTask = (cardId) => {
    const taskData = {
      description: newTaskDescription,
      completed: false,
    };
    dispatch(createCardTask(cardId, taskData));
  };

  const handleIsEditingTask = (taskId) => {
    setIsEditingTask(!isEditingTask);
  };

  const handleIsAddingTask = () => {
    setIsAddingTask(!isAddingTask);
  };

  const handleEditSubmit = (taskId) => {
    const updatedTaskData = {
      description: editTaskDescription,
      completed: true,
    };
    dispatch(editCardTaskById(taskId, updatedTaskData));
  };

  const handleDeleteCardTask = (taskId) => {
    dispatch(deleteCardTaskById(taskId));
  };

  const handleLoadCardTasks = (cardId) => {
    dispatch(getAllCardTasks(cardId));
  };

  const handleGetCardById = (cardId) => {
    dispatch(getCard(cardId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('Drag End:', event);
  
    if (over) {
      // Extract cardId and originalListId from the active id
      const activeIdParts = active.id.split('-');
      const cardId = activeIdParts[1];
      const originalListId = activeIdParts[3];
  
      // Extract newListId from the over id
      const overIdParts = over.id.split('-');
      const newListId = overIdParts[1];
  
      console.log(`Card ID: ${cardId}, Original List ID: ${originalListId}, New List ID: ${newListId}`);
  
      if (cardId && newListId) {
        // Dispatch action to update the card's listId
        dispatch(editCardById(cardId, { list_id: newListId }))
          .then(() => {
            console.log(`Card ${cardId} moved from list ${originalListId} to list ${newListId}`);
            // Fetch the updated lists and cards
            dispatch(getCardsByList(originalListId)).then(() => {
                dispatch(getCardsByList(newListId));
            });
          })
          .catch((error) => {
            console.error('Error updating card list:', error);
          });
      } else {
        console.error('Failed to parse activeId or overId');
      }
    } else {
      console.warn('No target to drop on');
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={styles.centeredContainer}>
        <div>
          <h1>Welcome to {board.Board?.name || 'Loading...'}</h1>
          <div className={styles.board}>
            <div className={styles.listContainer}>
              {Object.values(lists).map((list) => (
                <Droppable key={list.id} id={`list-${list.id}`}>
                  <div className={styles.lists}>
                    <h2>{list.name}</h2>
                    <div className={styles.cards}>
                      {cards[list.id]?.Cards?.length > 0 ? (
                        cards[list.id].Cards.map((card, index) => (
                            <Draggable key={card.id} id={`card-${card.id}-list-${list.id}`}>
                            <div className={styles.card}>
                              <h3>{card.title}</h3>
                              <p>{card.description}</p>
                            </div>
                          </Draggable>
                        ))
                      ) : (
                        <p>No cards available</p>
                      )}
                    </div>
                  </div>
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default BoardDetails;
