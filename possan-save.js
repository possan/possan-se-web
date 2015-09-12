var Q = require('q');
var fs = require('fs');
var pathmodule = require('path');
var Saver = require('./tool/lib/saver.js').Saver;
var TemplateDefinition = require('./_templates/possan/template.js').TemplateDefinition;

var config = require('./possan-config.js');

var saver = new Saver(config);
console.log('Loading site content...');
saver.load('_temp/output.json').then(function() {
	console.log('Site output loaded.');
	saver.save('output/').then(function() {
		console.log('Site output written to disk.');
	});
});
