var pathmodule = require('path');

var OutputRepository = function() {
	this.documents = [];
	this.statics = [];
}

OutputRepository.prototype.addDocument = function(path, doc) {
	var bn = pathmodule.basename(path);
	var dn = pathmodule.dirname(path);

	if (path == '/' || path == '') {
		this.documents.push({
			canonical: '',
			filename: 'index.html',
			basepath: '',
			content: doc
		});
	} else {
		this.documents.push({
			canonical: path,
			filename: 'index.html',
			basepath: path,
			content: doc
		});

		if (bn) {
			if(dn) {
				this.documents.push({
					canonical: path,
					filename: bn + '.html',
					basepath: dn,
					content: doc
				});
			} else {
				this.documents.push({
					canonical: path,
					filename: 'index.html',
					basepath: bn,
					content: doc
				});
			}
		}
	}
}

OutputRepository.prototype.addStatic = function(sourcepath, targetlocalpath) {
	/*
	var dupe = false;

	this.statics.forEach(function(x) {
		dupe |= (x.dest == targetlocalpath);
	});

	if (dupe) {
		console.log('Not adding duplicate static file: ' + targetlocalpath);
		return;
	}
	*/

	this.statics.push({
		src: sourcepath,
		dest: targetlocalpath,
		// outputtarget: target
	});
}

exports.OutputRepository = OutputRepository;

