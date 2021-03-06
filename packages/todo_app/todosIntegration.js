import ToDoUserAssignmentScreen from './todo_app';
import ToDosReducers from './src/toDos/state/reducers';
import { usersReducers } from './src/users';

export default ToDoUserAssignmentScreen;
const routeData = {
  routesMap:{
    TODOS: '/todos/:filter'
  },
  routeRootComponent: ToDoUserAssignmentScreen,
  reducers: {
    toDos: ToDosReducers,
    users: usersReducers,
  },
};
export {routeData};