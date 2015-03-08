var pathmodule = require('path');
var minimatch = require("minimatch");

var ContentRepository = function(config) {
	this.documents = [];
	this.config = config;
}

ContentRepository.prototype.addDocument = function(doc) {
	// console.log('Adding document', doc);
	doc.local_url = '/' + doc.path;
	doc.canonical_url = this.config.baseurl + doc.path;
	doc._html = doc.html;
	delete(doc.html);
	var ts = Date.parse(doc.date);
	doc._date = new Date(ts);
	doc._timestamp = ts;
	doc._year = doc._date.getFullYear();
	doc._month = doc._date.getMonth() + 1;
	doc._day = doc._date.getDate();
	// console.log('Added document', doc);
	this.documents.push(doc);
}

ContentRepository.prototype.findPaths = function(pathglob) {
	var ret = [];
	this.documents.forEach(function(doc) {
		try {
			if (minimatch(doc.path, pathglob)) {
			 	ret.push(doc.path);
			}
		} catch(e) {
			console.error(e);
		}
	});
	return ret;
}

ContentRepository.prototype.findAll = function(pathglob) {
	var ret = [];
	this.documents.forEach(function(doc) {
		try {
			if (minimatch(doc.path, pathglob)) {
			 	ret.push(doc);
			}
		} catch(e) {
			console.error(e);
		}
	});
	return ret;
}

exports.ContentRepository = ContentRepository;
