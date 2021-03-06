import React from 'react'
import { Provider } from 'react-redux'

import { connect } from 'react-redux'
import { TransitionGroup, Transition } from 'transition-group'
import universal from 'react-universal-component'
import { addRoutes } from 'redux-first-router'

import DevTools from './DevTools'
import Sidebar from './Sidebar'

import styles from '../css/App'



import Loading from './Loading'
import Err from './Error'
import isLoading from '../selectors/isLoading'
import switcherStyles from '../css/Switcher'
import {
  ApolloProvider,
} from 'react-apollo';
// import {routeData} from 'virtual-module-initialAppIntegration';



const UniversalComponent = universal(
  ({ page }) => {
    // debugger;
    if (page.importAvenue === 'demo') {
      const imported = import(`./${page.fileKey}`);
      return imported;
    }
    if (page.importAvenue === 'temp') {
      const imported = import(`asyncDir_REPLACE_ME${page.fileKey}`)
      return imported;
    }
  },
  {
    minDelay: 500,
    loading: Loading,
    error: Err,
    onLoad: (module, info, props, context) => {
      if(module && module.routeData){
        if (module.routeData.routesMap) {
          const aThunk = addRoutes(module.routeData.routesMap) // export new routes from component file
          context.store.dispatch(aThunk)
        }
        if (module.routeData.reducers) {
          props.injectReducers('',module.routeData.reducers);
        }
      }

      // // if a route triggered component change, new reducers needs to reflect it
      const state = context.store.getState();
      context.store.dispatch({ type: state.location.type, payload: state.location.payload })

      // context.store.dispatch({ type: 'INIT_ACTION_FOR_ROUTE', payload: { param: props.param } })
       
    }
  }
)


let DemoWrapper = ({ page, direction, location, children }) => {
  if (location.pathname.indexOf('/willard') !== 0) {
    return children;
  }
  return (
    <div className={styles.app}>
      <Sidebar />
      <TransitionGroup
        className={`${switcherStyles.switcher} ${direction}`}
        duration={500}
        prefix='fade'
      >
        <Transition key={page}>
          <div>
            {children}
            <DevTools />
          </div>
        </Transition>
      </TransitionGroup>
    </div>
  );
};

DemoWrapper = connect(({ page, direction,location }) => ({
  page,
  direction,
  location,
}))(DemoWrapper)


let Switcher = ({ page, isLoading, injectReducers }) => {
  const Comp = page.fileKey === 'Migration' ? routeData.routeRootComponent : UniversalComponent;

  return (
    <DemoWrapper>
      <Comp page={page} isLoading={isLoading} injectReducers={injectReducers} />
    </DemoWrapper>
  );
};

Switcher = connect(({ page, ...state }) => ({
  page,
  isLoading: isLoading(state)
}))(Switcher)







export default ({store,injectReducers,client}) => {
  return (
    <ApolloProvider store={store} client={client} >
      <div>
        <Switcher injectReducers={injectReducers} />
      </div>
    </ApolloProvider>
  );
};

/*
import 'babel-polyfill';
import React from 'react';
import { Provider } from 'react-redux';
export default function App (props) {
  return (
    <Provider store={props.store}>
      <p>H!</p>
    </Provider>
    
  );
}

*/
