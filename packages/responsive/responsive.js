// Passthrough
import generateGiantSquareDetails from './generateGiantSquareDetails';

export { generateGiantSquareDetails };

// Module deps
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeResponsive, registerResponsiveRefresh } from './responsiveService';
import { connect } from 'react-redux';



const ResponsiveHOC = (ComponentToWrap, defaults) => {
  class Responsive extends Component {
    constructor() {
      super();
      this.state = {
      };
      this.unregisters = [];
    }
    componentDidMount() {
      const masterName = this.props.masterName || defaults.masterName;
      const turns = this.props.turns || defaults.turns;
      turns.forEach((turn) => {
        const instance = makeResponsive(
          masterName, turn.priority, this.el, turn.statusIncrementsRoundUp,
          (updateDetails) => {
            if (updateDetails.style) {
              this.setState({
                style: updateDetails.style,
              });
            }
          },
          turn.magicSquareName
        );
        this.unregisters.push(instance.unregisterResponsiveAssessment);
      });
    }
    componentWillUnmount() {
      this.unregisters.forEach((cb) => {
        cb();
      });
    }
    render() {
      return (
        <ComponentToWrap
          responsiveRef={(el) => { this.el = el; }}
          style={this.state.style}
        >
          {this.props.children}
        </ComponentToWrap>
      );
    }
  }
  Responsive.propTypes = {
    masterName: PropTypes.string,
    children: PropTypes.array,
    priority: PropTypes.number,
    statusIncrementsRoundUp: PropTypes.object,
    turns: PropTypes.arrayOf(PropTypes.shape({
      priority: PropTypes.number,
      magicSquareName: PropTypes.func,
      statusIncrementsRoundUp: PropTypes.object,
    }).isRequired),
  };
  return Responsive;
};
export default ResponsiveHOC;

/* eslint-disable react/no-multi-comp */
function ResponsiveMasterHOC(Comp) {
  class ResponsiveMaster extends Component {
    constructor(props) {
      super();
      this.state = {
        activeStatuses: [],
        activeStatusRegistry: {},
        activeStatusesDict: {},
        realClassNameYall: '',
      };
      props.doThing({});
    }
    
    componentDidMount() {
      this.unregisterResponsiveRefresh = registerResponsiveRefresh({
        name: this.props.name,
        updateMasterClasses: (...args) => { return this.updateMasterClasses(...args); },
        nukeActiveStatusRegistryOnMaster: () => {
          this.setState({
            activeStatuses: [],
            activeStatusRegistry: {},
            activeStatusesDict: {},
            realClassNameYall: '',
          });
          this.props.doThing({});
        },
      });
    }
    componentWillUnmount() {
      this.unregisterResponsiveRefresh();
    }

    updateMasterClasses(idPriority, activeStatusRegistry) {
      const objectComplexUpdate = {
        ...this.state.activeStatusRegistry,
        [idPriority]: activeStatusRegistry,
      };

      const toReturn = {};
      Object.keys(objectComplexUpdate).forEach((priority) => {
        const priorityClassNames = objectComplexUpdate[priority];
        Object.keys(priorityClassNames).forEach((name) => {
          if (priorityClassNames[name]) {
            toReturn[name] = true;
          }
        });
      });

      const realClassNameYall = Object.keys(toReturn).reduce((c, n) => {
        return `${c} responsive_${n}`;
      }, '');
      this.setState({
        realClassNameYall,
        activeStatusRegistry: objectComplexUpdate,
        activeStatuses: Object.keys(toReturn),
        activeStatusesDict: toReturn,
      });
      this.props.doThing(toReturn);
      return toReturn;
    }
    render() {
      return (<Comp className={`${this.state.realClassNameYall}`} activeStatuses={this.state.activeStatuses} activeStatusesDict={this.state.activeStatusesDict} >{this.props.children}</Comp>);
    }
  }
  ResponsiveMaster.propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired,
    doThing: PropTypes.func,
  };
  ResponsiveMaster.defaultProps = {
    doThing: () => {},
  };
  return ResponsiveMaster
  // return ResponsiveMaster;
}

class ResponsiveMaster extends Component {
  constructor() {
    super();
    this.state = {
      activeStatusRegistry: {},
      realClassNameYall: '',
    };
  }

  componentDidMount() {
    this.unregisterResponsiveRefresh = registerResponsiveRefresh({
      name: this.props.name,
      updateMasterClasses: (...args) => { return this.updateMasterClasses(...args); },
      nukeActiveStatusRegistryOnMaster: () => {
        this.setState({
          activeStatusRegistry: {},
          realClassNameYall: '',
        });
      },
    });
  }
  componentWillReceiveProps(nextProps){
    console.log('jjjj');
    if (nextProps.doThing && nextProps.activeStatusesDict) {
      nextProps.doThing(nextProps.activeStatusesDict);
    }
    
  }
  componentWillUnmount() {
    this.unregisterResponsiveRefresh();
  }

  updateMasterClasses(idPriority, activeStatusRegistry) {
    const objectComplexUpdate = {
      ...this.state.activeStatusRegistry,
      [idPriority]: activeStatusRegistry,
    };

    const toReturn = {};
    Object.keys(objectComplexUpdate).forEach((priority) => {
      const priorityClassNames = objectComplexUpdate[priority];
      Object.keys(priorityClassNames).forEach((name) => {
        if (priorityClassNames[name]) {
          toReturn[name] = true;
        }
      });
    });

    const realClassNameYall = Object.keys(toReturn).reduce((c, n) => {
      return `${c} responsive_${n}`;
    }, '');
    this.setState({
      realClassNameYall,
      activeStatusRegistry: objectComplexUpdate,
    });
    return toReturn;
  }
  render() {
    return (<div className={this.state.realClassNameYall}>{this.props.children}</div>);
  }
}
ResponsiveMaster.propTypes = {
  name: PropTypes.string,
  children: PropTypes.object,
};
ResponsiveMaster = connect(
  () => {
    return {};
  },
  {
    doThing: (responsiveStatusesDict) => {
      return {
        name: 'bernie',
        responsiveStatusesDict,
        type:'UDATE_RESPONSIVE_STATUSES_DICT'
      }
    },
  }
)(ResponsiveMaster);
export { ResponsiveMaster };

export { ResponsiveMasterHOC };
