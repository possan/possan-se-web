//
//
//

var Loader = require('./tool/lib/loader.js').Loader;

var config = require('./possan-config.js');

var loader = new Loader(config);
console.log('Loading site content...');
loader.load().then(function() {
	console.log('Site content loaded.');
	loader.contentrepo.save('_temp/content.json');
});
