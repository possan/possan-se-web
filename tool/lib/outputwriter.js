var Q = require('q');
var pathmodule = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var fsextra = require('fs-extra');
var child_process = require('child_process');

var OutputWriter = function(config, outputrepo, outputfolder) {
	this.config = config;
	this.outputfolder = outputfolder || config.outputfolder;
	this.outputrepo = outputrepo;
}

OutputWriter.prototype.writeOneDocument = function(doc) {
	var future = Q.defer();
	// console.log('writeOneDocument', doc.target_path, doc);
	var src = doc.src;
	// var dest = this.outputfolder + '/' + doc.basepath + '/' + doc.filename;
	var dest = pathmodule.join(this.outputfolder, doc.target_path);
	var destfolder = pathmodule.dirname(dest);
	// console.log('Creating: ' + destfolder);
	mkdirp.sync(destfolder);
	console.log('Writing document: ' + dest);
	fs.writeFileSync(dest, doc.content, 'UTF-8');
	future.resolve(true);
	return future.promise;
}

OutputWriter.prototype.generateOneThumbnail = function(doc) {
	var future = Q.defer();
	// console.log('copyOneStatic', doc.target_path, doc);
	var src = doc.source_path;
	var dest = pathmodule.join(this.outputfolder, doc.target_path);




	console.log('Copying and transforming ' + src + ' to ' + dest, doc.transform);





	var cmd = '';

	if (doc.transform.mode == 'fit') {
		if (doc.transform.maxwidth) {
			cmd = 'convert "' + src + '" -resize "' + doc.transform.maxwidth + '" "' + dest + '"';
		}
	}

	if (cmd == '') {
		cmd = 'convert "' + src + '" "' + dest + '"';
	}

	console.log('Command: ' + cmd);

	var child = child_process.exec(cmd)
	child.stdout.pipe(process.stdout)
	child.on('exit', function() {
		future.resolve(true);
	});

/*
	try {
		fsextra.copySync(src, dest);
	} catch(e) {
		console.error(e);
	}
*/
	return future.promise;
}

OutputWriter.prototype.copyOneStaticFile = function(doc) {
	var future = Q.defer();
	// console.log('copyOneStatic', doc.target_path, doc);
	var src = doc.source_path;
	var dest = pathmodule.join(this.outputfolder, doc.target_path);
	console.log('Copying ' + src + ' to ' + dest);
	try {
		fsextra.copySync(src, dest);
	} catch(e) {
		console.error(e);
	}
	future.resolve(true);
	return future.promise;
}

OutputWriter.prototype.writeSingle = function(doc) {
	// console.log('writeSingle', doc);
	switch(doc.type) {
		case 'static':
		case 'reference':
			return this.copyOneStaticFile(doc);

		case 'thumbnail':
			return this.generateOneThumbnail(doc);

		case 'document':
			return this.writeOneDocument(doc);

		default:
			var future = Q.defer();
			future.resolve(true);
			return future.promise;
	}
	// var src = doc.src;
	// // var dest = this.outputfolder + '/' + doc.basepath + '/' + doc.filename;
	// var destfolder = pathmodule.join(this.outputfolder, doc.basepath);
	// var dest = pathmodule.join(destfolder, doc.filename);
	// console.log('Writing: ' + dest);
	// mkdirp.sync(destfolder);
	// fs.writeFileSync(dest, doc.content, 'UTF-8');
}

OutputWriter.prototype.writeAll = function() {
	return Q.allSettled(this.outputrepo.documents.map(this.writeSingle.bind(this)));
}

exports.OutputWriter = OutputWriter;
