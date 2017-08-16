import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import {routingReducers, routingMiddleware, routingEnhancer} from './Routing';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import ToDosReducers from 'todo_app/src/toDos/state/reducers';
import { usersReducers } from 'todo_app/src/users';
import { bernieReducers } from 'bernie/setup';
import appRootReducers from './appRootReducers';
import history from '@defualt/shared-history';


const configureStore = () => {
  const middlewares = [thunk, routingMiddleware];
  if (process.env.NODE_ENV !== 'production') {
    // middlewares.push(createLogger());
  }

  return createStore(
    combineReducers({
      ...routingReducers,
      toDos: ToDosReducers,
      users: usersReducers,
      appRoot: appRootReducers,
      bernie: bernieReducers,
    }),
    // middleware/* applyMiddleware(middleware)
    // /* createStore(rootReducer, compose(routingEnhancer, middlewares))
    compose(routingEnhancer, applyMiddleware(...middlewares))
  );
};

export default configureStore;
