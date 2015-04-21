var Q = require('q');
var fs = require('fs');
var ContentRepository = require('./contentrepo').ContentRepository;
var OutputRepository = require('./outputrepo').OutputRepository;
var contentloader = require('./contentloader');
var MarkdownLoader = require('./markdownloader').MarkdownLoader;
var TemplateCache = require('./templatecache').TemplateCache;

var Generator = function(config, siteclass, template) {
	this.config = config;
	this.siteclass = siteclass;
	this.contentrepo = null;
	this.template = template;
}

//
// load config
//

Generator.prototype.generate = function(datafile) {
	var _this = this;
	var loadfuture = Q.defer();

	//
	// globals
	//

	this.contentrepo = new ContentRepository(this.config);
	this.outputrepo = new OutputRepository(this.config);
	this.templatecache = new TemplateCache(this.config, this.outputrepo, this.template);

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

	function writeAllGeneratedFiles() {
		// console.log('in writeAllGeneratedFiles');
		return _this.outputwriter.writeAllDocuments();
	}

	function copyAllStaticFiles() {
		// console.log('in copyAllStaticFiles');
		return _this.outputwriter.copyAllStaticFiles();
	}


	generateSite()
		.then(writeAllGeneratedFiles)
		.then(copyAllStaticFiles)
		.then(function() {
			console.log('All done.');
			loadfuture.resolve(this);
		});

	return loadfuture.promise;
}

exports.Generator = Generator;
