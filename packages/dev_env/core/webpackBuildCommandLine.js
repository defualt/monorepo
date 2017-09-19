import webpack from 'webpack';
import webpackRunCompiler from './webpackRunCompiler';
import webpackConfig from './webpackConfigCommandLine';

function webpackMakeCompiler() {
  const config = webpackConfig();
  const compiler = webpack(config);
  return compiler;
}

export default () => {
  webpackRunCompiler(webpackMakeCompiler());
};
