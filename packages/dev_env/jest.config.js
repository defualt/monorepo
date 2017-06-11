/* eslint-disable */

var reg = /(.*)\/([^/]+$)/igm; //get hashtags
var string = './two';

var matches = string.match(reg).map(e => e.replace(reg, '$1/$2/$2.js'));
console.log('matches',matches);
const rootDir = process.cwd();
console.log('__dirname',__dirname);
console.log('CONFIG mfer',rootDir);
module.exports = {
  verbose: true,
  testMatch: ['**/?(*.)(test).js?(x)'],
  rootDir: rootDir,
  moduleDirectories: ["node_modules", "packages"], // /Users/brianephraim/Sites/monorepo/packages
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `${__dirname}/__mocks__/fileMock.js`,
    '\\.(css|less)$': "identity-obj-proxy",
    // simulate behavior of directory-named-webpack-plugin in webpack config
    '^\@[^/]+\/([a-zA-Z][^/]*)\/([^/]+$)': '$1/$2/$2.js',// matches '@defualt/one/two' into 'one/two/two.js'
    '^\@[^/]+\/([a-zA-Z][^/]*$)': '$1/$1.js', // matches '@defualt/one' into 'one/one.js'
    '(.*)\/([^/]+$)': '$1/$2/$2.js', // matches './two' into './two/two.js' 

    '(^[a-zA-Z][^/]*$)': '$1/$1.js', // matches 'one' into 'one/one.js' 
    
  },
  moduleFileExtensions: ["js", "jsx"],
  "modulePathIgnorePatterns": [
    '<rootDir>.*\/node_modules\/.*'
    // "<rootDir>[/\\\\](node_modules|tempRepos)[/\\\\]"
  ],
};
