var pathmodule = require('path');
var fs = require('fs');

var OutputRepository = function(config) {
	this.config = config;
	this.documents = [];
	this.statics = [];
}

OutputRepository.prototype.noStartingSlash = function(path) {
	if (path && path.substring(0,1) == '/')
		return path.substring(1);
	return path;
}

OutputRepository.prototype._addContentDocument = function(targetlocalpath, content) {

	targetlocalpath = this.noStartingSlash(targetlocalpath);

	var dupe = false;

	this.documents.forEach(function(x) {
		dupe |= (x.target_path == targetlocalpath);
	});

	if (dupe) {
		console.log('Not adding duplicate static file: ' + targetlocalpath);
		return;
	}

	this.documents.push({
		type: 'document',
		content: content,
		target_path: targetlocalpath,
	});
}

OutputRepository.prototype.addDocument = function(path, doc) {
	var bn = pathmodule.basename(path);
	var dn = pathmodule.dirname(path);

	if (path == '/' || path == '') {
		this._addContentDocument('index.html', doc);
		return;
	}
	this._addContentDocument( pathmodule.join(path, 'index.html'), doc);
	if (bn) {
		if(dn) {
			this._addContentDocument( pathmodule.join(dn, bn + '.html'), doc);
		} else {
			this._addContentDocument( bn + '.html', doc);
		}
	}
}

OutputRepository.prototype.addStatic = function(sourcepath, targetlocalpath, transform) {

	targetlocalpath = this.noStartingSlash(targetlocalpath);

	var dupe = false;

	this.documents.forEach(function(x) {
		dupe |= (x.target_path == targetlocalpath);
	});

	if (dupe) {
		console.log('Not adding duplicate static file: ' + targetlocalpath);
		return;
	}

	this.documents.push({
		type: transform ? 'thumbnail' : 'static',
		source_path: sourcepath,
		target_path: targetlocalpath,
		transform: transform
	});
}


OutputRepository.prototype.addThumbnail = function(imagename, ids, sourcefolder, targetlocalpath, targetlocalpath2) {
	 console.log('addThumbnail', imagename, ids, sourcefolder, targetlocalpath, targetlocalpath2);

	if (!imagename) {
		var mapping = {};
		ids.forEach(function(id) {
			mapping[id] = null;
		});
		return mapping;
	}

	if (imagename.indexOf('.gif') != -1) {
		console.log('found gif, don\'t resize!', imagename);
		var mapping = {};
		ids.forEach(function(id) {
			var targetlocalpath6 = pathmodule.join(targetlocalpath, imagename);
			console.log('targetlocalpath6', targetlocalpath6);
			mapping[id] = targetlocalpath6;
		});
		return mapping;
	}

	var _this = this;

	var srcpath = pathmodule.join( sourcefolder, imagename );
	var ext = pathmodule.extname(imagename);
	var prefix = pathmodule.basename(imagename, ext);

	var mapping = {};

	ids.forEach(function(id) {

		var xform = {};

		if (_this.config.imagetemplaß) _this.config.imagetemplates.forEach(function(tmpl) {
			if (tmpl.id == id) {
				xform = tmpl;
			}
		});

		var newfilename = prefix + '-' + id + ext;

		var targetlocalpath50 = pathmodule.join(targetlocalpath, newfilename);

		var obj = {
			type: 'thumbnail',
			source_path: srcpath,
			target_path: _this.noStartingSlash(targetlocalpath50),
			transform: xform
		};

		_this.documents.push(obj);

		mapping[id] = targetlocalpath50;
	});

	return mapping;
}


OutputRepository.prototype.save = function(filepath) {
	var blob = JSON.stringify(this.documents, null, 2);
	fs.writeFileSync(filepath, blob, 'UTF-8');
}

OutputRepository.prototype.load = function(filepath) {
	this.documents = [];
	try {
		var blob = fs.readFileSync(filepath, 'UTF-8');
		this.documents = JSON.parse(blob);
	} catch(e) {
	}
}

exports.OutputRepository = OutputRepository;

