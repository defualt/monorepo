import React from 'react'
import { Provider } from 'react-redux'

import DevTools from './DevTools'
import Sidebar from './Sidebar'

import styles from '../css/App'

import { connect } from 'react-redux'
import { TransitionGroup, Transition } from 'transition-group'
import universal from 'react-universal-component'
import { addRoutes } from 'redux-first-router'

import Loading from './Loading'
import Err from './Error'
import isLoading from '../selectors/isLoading'
import switcherStyles from '../css/Switcher'

import test2 from '../../test2';

console.log('TEST2????',test2);

const UniversalComponent = universal(
  ({ page }) => {
    console.log('page',page);
    if (page === 'BATTLESHIP') {
      page = 'Migration';
    }
    return import(`./${page}`)
  },
  {
    minDelay: 500,
    loading: Loading,
    error: Err,
    onLoad: (module, info, props, context) => {
      console.log('module',module)
      console.log('info',info)
      console.log('props',props)
      console.log('context',context)
  /*
       const aThunk = addRoutes(module.newRoutes) // export new routes from component file
       context.store.dispatch(aThunk)

       context.store.replaceReducer({ ...otherReducers, foo: module.fooReducer })

       // if a route triggered component change, new reducers needs to reflect it
       context.store.dispatch({ type: 'INIT_ACTION_FOR_ROUTE', payload: { param: props.param } })
       */
    }
  }
)

let Switcher = ({ page, direction, isLoading }) =>
  <div className={styles.app}>
    <Sidebar />
    <TransitionGroup
      className={`${switcherStyles.switcher} ${direction}`}
      duration={500}
      prefix='fade'
    >
      <Transition key={page}>
        <UniversalComponent page={page} isLoading={isLoading} />
      </Transition>
    </TransitionGroup>
  </div>

const mapState = ({ page, direction, ...state }) => ({
  page,
  direction,
  isLoading: isLoading(state)
})

Switcher = connect(mapState)(Switcher)

export default (props) =>
  <Provider store={props.store}>
    <div>
      <Switcher />
      <DevTools />
    </div>
  </Provider>
