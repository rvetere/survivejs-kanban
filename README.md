# mojito-react
vp24 editor with react.js and webpack (and sass, bootstrap, jquery and a flux implementation)

## setup
- checkout
- npm install
- npm start
- goto localhost:2300

## npm run build
will make a production ready build in /build directory

## npm run stats
will generate stats.json at project root, ready to analyze the whole build on http://webpack.github.io/analyse

## npm run deploy
will push the current /build to github pages - served on http://rvetere.github.io/mojito-react/

## npm test
will run karma unit tests, he will pickup all files named "*_test.js" under /test directory

## npm run tdd
will start test-driven-developement mode, write tests and he will execute them live on every change

> tests will generate coverage-report under /build/coverage

> look on https://facebook.github.io/react/docs/test-utils.html for in-depth infos how to test react.js
