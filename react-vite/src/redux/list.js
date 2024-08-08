// src/redux/list.js

const GET_LISTS_BY_BOARD = 'lists/LOAD_BY_BOARD';


const getListsByBoardAction = (lists) => ({
  type: GET_LISTS_BY_BOARD,
  lists,
});

export const getListsByBoard = (boardId) => async (dispatch) => {
  const response = await fetch(`/api/boards/${boardId}/lists`);
  const lists = await response.json();
  dispatch(getListsByBoardAction(lists));
};

const initialState = { allLists: {} };

const listsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LISTS_BY_BOARD: {
      const allLists = {};
      action.lists.Lists.forEach((list) => {
        allLists[list.id] = list;
      });
      return { 
        ...state, 
        allLists: { ...allLists },
        };
    }
    default:
      return state;
  }
};

export default listsReducer;
