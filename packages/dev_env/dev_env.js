/* eslint-disable no-console */
import webpack from 'webpack';
import { argv } from 'yargs';
import shellCommand from './core/shellCommand';
import jestSpawnProcess from './jest/jestSpawnProcess';
import webpackRunCompiler from './core/webpackRunCompiler';
import webpackBuildCommandLine from './core/webpackBuildCommandLine';
import startUniversalExpress from './startUniversalExpress';
import webpackConfig from './webpackConfig'; 
// import isWithinMonoRepo from './core/isWithinMonoRepo');
const env = argv.env;
const item = argv.item;

if (item) {
  shellCommand(`(cd ./packages/${item} && npm run start)`);
} else if (env === 'test') {
  jestSpawnProcess(argv.testdevenv, argv.watch, argv.testPathPattern);
} else if (argv.entry) {
  webpackBuildCommandLine();
} else if (env === 'build') {
  webpackRunCompiler(webpack(webpackConfig()));  
} else {
  startUniversalExpress();
}
