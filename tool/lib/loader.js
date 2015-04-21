var Q = require('q');
var fs = require('fs');
var ContentRepository = require('./contentrepo').ContentRepository;
var contentloader = require('./contentloader');
var FolderLoader = require('./folderloader').FolderLoader;
var MarkdownLoader = require('./markdownloader').MarkdownLoader;

var Loader = function(config, siteclass) {
	this.config = config;
	this.siteclass = siteclass;
	this.contentrepo = null;
}

//
// load config
//

Loader.prototype.load = function() {
	var _this = this;
	var loadfuture = Q.defer();

	//
	// globals
	//

	this.contentrepo = new ContentRepository(this.config);

	//
	// load all input

	function loadAllContent() {
		var future = Q.defer();

		FolderLoader.scanFolders(_this.config.contentfolders).then(function(allfiles) {
			// console.log('all content filenames', allfiles);

			Q.allSettled(allfiles.map(function(sfp) {
				return MarkdownLoader.loadFile(sfp, _this.contentrepo, _this.config);
			})).then(function() {
				// console.log('all content loaders are done');

				future.resolve(true);
			});
		});

		return future.promise;
	}

	function loadAllStaticFiles() {
		var all_static_promises = [];

		_this.config.staticfolders.forEach(function(folder) {
			// console.log('static config', folder);
			var future2 = Q.defer();

			FolderLoader.scanFolder(folder.src+'/**/*').then(function(allstatic) {
				// console.log('allstatic', allstatic);

				allstatic.forEach(function(sfp) {
					_this.contentrepo.addStatic(sfp, sfp.substring(folder.src.length-1), folder.target);
				});

				// console.log('allstatic', allstatic);
				future2.resolve(true);
			});

			all_static_promises.push(future2.promise);
		});

		return Q.allSettled(all_static_promises);
	}

	loadAllContent()
		.then(loadAllStaticFiles)
		.then(function() {
			console.log('All loading done.');
			loadfuture.resolve(this);
		});

	return loadfuture.promise;
}

exports.Loader = Loader;
