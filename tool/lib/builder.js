var Q = require('q');
var fs = require('fs');
var ContentRepository = require('./contentrepo').ContentRepository;
var OutputRepository = require('./outputrepo').OutputRepository;
var contentloader = require('./contentloader');
var FolderLoader = require('./folderloader').FolderLoader;
var MarkdownLoader = require('./markdownloader').MarkdownLoader;
var TemplateCache = require('./templatecache').TemplateCache;

var Builder = function(config, siteclass, template) {
	this.config = config;
	this.siteclass = siteclass;
	this.contentrepo = null;
	this.template = template;
}

//
// load config
//

Builder.prototype.build = function(contentfile) {
	var _this = this;
	var loadfuture = Q.defer();

	//
	// globals
	//

	this.contentrepo = new ContentRepository(this.config);
	this.outputrepo = new OutputRepository(this.config);
	this.templatecache = new TemplateCache(this.config, this.outputrepo, this.template);

	this.contentrepo.load(contentfile);

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

	generateSite()
		.then(function() {
			console.log('All done.');
			loadfuture.resolve(this);
		});

	return loadfuture.promise;
}

Builder.prototype.save = function(filepath) {
	this.outputrepo.save(filepath);
}

exports.Builder = Builder;
