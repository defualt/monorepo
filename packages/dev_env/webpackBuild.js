import webpackCompile from './webpackCompile';
import webpackRunner from './webpackRunner';

export default () => {
  webpackRunner(webpackCompile);
};
