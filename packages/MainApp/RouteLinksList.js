import React from 'react';
import { connect } from 'react-redux';
import Link from 'redux-first-router-link'

let LandingScreen = (props) => {
  return (
    <div>
      <h1>WELCOME</h1>
      { props.routeInfos.map((details) => {
        return (
          <div key={details.path}>
            <Link to={details.demoPath || details.path}>
              {details.description}
            </Link>
          </div>
        );
      }) }
    </div>
  );
};
LandingScreen = connect(
  (state) => {
    return {
      routeInfos: state.routeInfos,
    }
  }
)(LandingScreen);

export default LandingScreen;