var allTestFiles = [];
var TEST_REGEXP  = /(spec|test)\.js$/i;

var pathToModule = function (path) {
	return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function (file) {
	if (TEST_REGEXP.test(file)) {
		// Normalize paths to RequireJS module names.
		allTestFiles.push(pathToModule(file));
	}
});

console.log('------------------------');
console.log(allTestFiles);
console.log('------------------------');

require.config({
	// Karma serves files under /base, which is the basePath from your config file
	baseUrl: '/base',

	paths: {
		'io': 'public/js/components/socket.io-1.3.5',
		'q':  'public/bower_components/q/q'
	},

	// dynamically load all test files
	deps: allTestFiles,

	// we have to kickoff jasmine, as it is asynchronous
	callback: window.__karma__.start
});
