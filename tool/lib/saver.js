var Q = require('q');
var fs = require('fs');
var ContentRepository = require('./contentrepo').ContentRepository;
var OutputRepository = require('./outputrepo').OutputRepository;
var contentloader = require('./contentloader');
var FolderLoader = require('./folderloader').FolderLoader;
var MarkdownLoader = require('./markdownloader').MarkdownLoader;
var OutputWriter = require('./outputwriter').OutputWriter;
var TemplateCache = require('./templatecache').TemplateCache;

var Saver = function(config) {
	this.config = config;
	this.outputrepo = null;
}

//
// load config
//

Saver.prototype.load = function(datafile) {
	var _this = this;
	var loadfuture = Q.defer();

	//
	// globals
	//

	// this.contentrepo = new ContentRepository(this.config);
	this.outputrepo = new OutputRepository(this.config);
	this.outputrepo.load(datafile);

	// function generateSite() {
	// 	var future = Q.defer();
	// 	// console.log('in generateSite');

	// 	var site = new _this.siteclass(_this.config, _this.contentrepo, _this.templatecache, _this.outputrepo);
	// 	try {
	// 		site.prepare().then(function() {
	// 			future.resolve(true);
	// 		});
	// 	} catch(e) {
	// 		console.error(e);
	// 		future.reject();
	// 	}

	// 	return future.promise;
	// }

	// function writeAllGeneratedFiles() {
	// 	// console.log('in writeAllGeneratedFiles');
	// 	return _this.outputwriter.writeAllDocuments();
	// }

	// function copyAllStaticFiles() {
	// 	// console.log('in copyAllStaticFiles');
	// 	return _this.outputwriter.copyAllStaticFiles();
	// }


	// generateSite()
	// 	.then(writeAllGeneratedFiles)
	// 	.then(copyAllStaticFiles)
	// 	.then(function() {
	// 		console.log('All done.');
	loadfuture.resolve(this);
	// });

	return loadfuture.promise;
}

Saver.prototype.save = function(outputpath) {
	var _this = this;
	var loadfuture = Q.defer();

	// this.templatecache = new TemplateCache(this.config, this.outputrepo, this.template);
	this.outputwriter = new OutputWriter(this.config, this.outputrepo, outputpath);

	/*
	//
	// globals
	//

	this.contentrepo = new ContentRepository(this.config);
	this.outputrepo = new OutputRepository(this.config);
	this.templatecache = new TemplateCache(this.config, this.outputrepo, this.template);
	this.outputwriter = new OutputWriter(this.config, this.outputrepo);

	this.contentrepo.load(datafile);

	function generateSite() {
	var future = Q.defer();
	// console.log('in generateSite');

	var site = new _this.siteclass(_this.config, _this.contentrepo, _this.templatecache, _this.outputrepo);
	try {
	site.prepare().then(function() {
	future.resolve(true);
	});
	} catch(e) {
	console.error(e);
	future.reject();
	}

	return future.promise;
	}
	*/
	function writeAll() {
		// console.log('in writeAllGeneratedFiles');
		return _this.outputwriter.writeAll();
	}

	writeAll().then(function() {
		console.log('All done.');
		loadfuture.resolve(this);
	});

	// return _this.outputwriter.writeAllDocuments();

	return loadfuture.promise;
}

exports.Saver = Saver;
