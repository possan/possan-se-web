var Q = require('q');
var fs = require('fs');
var wmd = require('wmd');

var MarkdownLoader = function() {
}

MarkdownLoader.loadFile = function(path, contentrepo) {
	var future = Q.defer();

	console.log('Loading', path);

	var raw = fs.readFileSync(path, 'UTF-8');
	var d = wmd(raw, {});

	// d.metadata._raw = raw;
	d.metadata.markdown = d.markdown;
	d.metadata.html = d.html;
	d._path = path;

	contentrepo.addDocument(d.metadata);

	future.resolve(true);

	return future.promise;
}

exports.MarkdownLoader = MarkdownLoader;
