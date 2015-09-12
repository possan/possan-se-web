var pathmodule = require('path');
var minimatch = require("minimatch");
var fs = require("fs");

var ContentRepository = function(config) {
	this.documents = [];
	this.config = config;
}

var startingSlash = function(path) {
	if (path && path.substring(0,1) != '/')
		return '/' + path;
	return path;
}

ContentRepository.prototype.addDocument = function(doc) {
	// console.log('Adding document', doc);
	doc.type = doc.type || 'document';
	doc.subtype = doc.subtype || 'unknown';
	doc.target_path = startingSlash(doc.target_path);
	doc.local_url = doc.target_path;
	doc.canonical_url = this.config.baseurl + doc.target_path;
	// doc._html = doc.html;
	delete(doc.html);
	var ts = Date.parse(doc.date);
	doc._isodate = new Date(ts);
	doc._timestamp = ts;
	doc._year = doc._isodate.getFullYear();
	doc._month = doc._isodate.getMonth() + 1;
	doc._day = doc._isodate.getDate();
	// console.log('Added document', doc);
	this.documents.push(doc);
}

ContentRepository.prototype.findPaths = function(pathglob) {
	var ret = [];
	this.documents.forEach(function(doc) {
		try {
			if (doc.type == 'document' && minimatch(doc.target_path, pathglob)) {
			 	ret.push(doc.target_path);
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
			if (doc.type == 'document' && minimatch(doc.target_path, pathglob)) {
			 	ret.push(doc);
			}
		} catch(e) {
			console.error(e);
		}
	});
	return ret;
}

ContentRepository.prototype.save = function(filename) {
	var blob = JSON.stringify(this.documents, null, 2);
	fs.writeFileSync(filename, blob, 'UTF-8');
}

ContentRepository.prototype.load = function(filename) {
	var blob = fs.readFileSync(filename, 'UTF-8');
	this.documents = JSON.parse(blob);
}

ContentRepository.prototype.addReference = function(sourcepath, targetlocalpath) {
	// console.log('addReference', sourcepath, targetlocalpath);

	targetlocalpath = startingSlash(targetlocalpath);

	var dupe = false;

	this.documents.forEach(function(x) {
		dupe |= (x.target_path == targetlocalpath);
	});

	if (dupe) {
		// console.log('Not adding duplicate static file: ' + targetlocalpath);
		return;
	}

	this.documents.push({
		type: 'reference',
		source_path: sourcepath,
		target_path: targetlocalpath,
		// outputtarget: target
	});
}

ContentRepository.prototype.addStatic = function(sourcepath, targetlocalpath) {
	// console.log('addStatic', sourcepath, targetlocalpath);

	targetlocalpath = startingSlash(targetlocalpath);

	var dupe = false;

	this.documents.forEach(function(x) {
		dupe |= (x.target_path == targetlocalpath);
	});

	if (dupe) {
		// console.log('Not adding duplicate static file: ' + targetlocalpath);
		return;
	}

	this.documents.push({
		type: 'static',
		source_path: sourcepath,
		target_path: targetlocalpath
	});
}

ContentRepository.prototype.addThumbnail = function(imagename, ids, sourcefolder, targetlocalpath) {
	console.log('addThumbnail', imagename, ids, sourcefolder, targetlocalpath);

	if (!imagename) {
		var mapping = {};
		ids.forEach(function(id) {
			mapping[id] = null;
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

		if (_this.config.imagetemplates) _this.config.imagetemplates.forEach(function(tmpl) {
			if (tmpl.id == id) {
				xform = tmpl;
			}
		});

		var newfilename = prefix + '-' + id + ext;

		var targetlocalpath2 = startingSlash(pathmodule.join(targetlocalpath, newfilename));

		var obj = {
			type: 'thumbnail',
			source_path: srcpath,
			target_path: targetlocalpath2,
			transform: xform
		};

		_this.documents.push(obj);

		mapping[id] = obj.target_path;
	});

	console.log('returning', mapping);

	return mapping;
}


exports.ContentRepository = ContentRepository;
