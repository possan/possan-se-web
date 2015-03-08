var Q = require('q');
var pathmodule = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var fsextra = require('fs-extra');

var OutputWriter = function(config, outputrepo) {
	this.config = config;
	this.outputrepo = outputrepo;
}

OutputWriter.prototype.writeOneDocument = function(doc) {
	var future = Q.defer();
	// console.log('writeOneDocument', doc);
	var src = doc.src;
	// var dest = this.config.outputfolder + '/' + doc.basepath + '/' + doc.filename;
	var destfolder = pathmodule.join(this.config.outputfolder, doc.basepath);
	var dest = pathmodule.join(destfolder, doc.filename);
	console.log('Writing: ' + dest);
	mkdirp.sync(destfolder);
	fs.writeFileSync(dest, doc.content, 'UTF-8');
	future.resolve(true);
	return future.promise;
}

OutputWriter.prototype.writeAllDocuments = function() {
	return Q.allSettled(this.outputrepo.documents.map(this.writeOneDocument.bind(this)));
}

OutputWriter.prototype.copyOneStaticFile = function(doc) {
	var future = Q.defer();
	// console.log('copyOneStatic', doc);
	var src = doc.src;
	var dest = pathmodule.join(this.config.outputfolder, doc.dest);
	console.log('Copying ' + src + ' to ' + dest);
	fsextra.copySync(src, dest);
	future.resolve(true);
	return future.promise;
}

OutputWriter.prototype.copyAllStaticFiles = function() {
	return Q.allSettled(this.outputrepo.statics.map(this.copyOneStaticFile.bind(this)));
}

exports.OutputWriter = OutputWriter;
