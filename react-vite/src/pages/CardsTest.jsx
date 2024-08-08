import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import './Splash.css';

const CardsTest = () => {
  const dispatch = useDispatch();
  const currentBoard = useSelector((state) => state.boards.currentBoard);
  const { id } = useParams();
  const cards = useSelector((state) => state.cards.allCardsByList);
  const lists = useSelector((state) => state.lists.allLists);
  // const cardTasks = useSelector((state) => state.cardTasks?.allCardTasks || {});
  // const currentCard = useSelector((state) => state.cards.currentCard);
  // const [selectedCardId, setSelectedCardId] = useState(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  // const [cardDetails, setCardDetails] = useState(null);
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    dispatch(getBoard(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (lists) {
      Object.keys(lists).forEach((listId) => {
        dispatch(getCardsByList(listId));
      });
    }
  }, [dispatch, lists]);

  useEffect(() => {
    dispatch(getListsByBoard(id));
  }, [dispatch, id]);

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

  const handleIsEditingTask = () => {
    setIsEditingTask(!isEditingTask);
  };

  const handleIsAddingTask = () => {
    setIsAddingTask(!isAddingTask);
  };

  const handleEditSubmit = (taskId) => {
    const updatedTaskData = {
      description: 'Updated Task Description',
      completed: true,
    };
    dispatch(editCardTaskById(taskId, updatedTaskData));
  };

  const handleDeleteCardTask = (taskId) => {
    dispatch(deleteCardTaskById(taskId));
  };

  const handleLoadCardTasks = (cardId) => {
    dispatch(getAllCardTasks(cardId));
    //   setSelectedCardId(cardId);
  };

  const handleGetCardById = (cardId) => {
    dispatch(getCard(cardId));
  };

  return (
    <div className="boards-container">
      {Object.values(cards).map((card) => (
        <div key={card.id} className="board-card">
          <h2 className="board-name">{card.title}</h2>
          <p className="board-description">{card.description}</p>
          <button onClick={handleIsAddingTask}>Add Task</button>
          {isAddingTask && (
            <input
              type="text"
              placeholder="New Task Description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
          )}
          <button onClick={() => handleLoadCardTasks(card.id)}>Load Tasks</button>
          <button onClick={() => handleGetCardById(3)}>Get Card By Id</button>
          <button onClick={() => handleEditCard(card.id)}>Edit Card Details</button>
          <button onClick={() => handleDeleteCard(card.id)}>Delete Card</button>
        </div>
      ))}
      <div>
        {/* ADD Submit button */}
        <button onClick={handleIsEditingTask}>Edit Task</button>
        {isEditingTask && (
          <div className="tasks-container">
            <div className="task-card">
              <input
                type="text"
                placeholder="Edit Task Description"
                value={editTaskDescription}
                onChange={(e) => setEditTaskDescription(e.target.value)}
              />
              <button onClick={() => handleEditSubmit(1)}>Submit Edit</button>
            </div>
          </div>
        )}
        <div>
          <button onClick={() => handleDeleteCardTask(1)}>Delete Task</button>
        </div>
      </div>
    </div>
  );
};

export default CardsTest;
