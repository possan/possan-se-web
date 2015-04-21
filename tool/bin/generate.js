var Q = require('q');
var fs = require('fs');
var ContentRepository = require('../lib/contentrepo').ContentRepository;
var OutputRepository = require('../lib/outputrepo').OutputRepository;
var contentloader = require('../lib/contentloader');
var FolderLoader = require('../lib/folderloader').FolderLoader;
var MarkdownLoader = require('../lib/markdownloader').MarkdownLoader;
var OutputWriter = require('../lib/outputwriter').OutputWriter;
var TemplateCache = require('../lib/templatecache').TemplateCache;

//
// load config
//

var config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));

//
// globals
//

var contentrepo = new ContentRepository(config);
var outputrepo = new OutputRepository(config);
var templatecache = new TemplateCache(config, outputrepo);
var outputwriter = new OutputWriter(config, outputrepo);

//
// load all input

function loadAllContent() {
	var future = Q.defer();

	FolderLoader.scanFolders(config.contentfolders).then(function(allfiles) {
		// console.log('all content filenames', allfiles);

		Q.allSettled(allfiles.map(function(sfp) {
			return MarkdownLoader.loadFile(sfp, contentrepo, outputrepo, config);
		})).then(function() {
			// console.log('all content loaders are done');

			future.resolve(true);
		});
	});

	return future.promise;
}

function loadAllStaticFiles() {
	var all_static_promises = [];

	config.staticfolders.forEach(function(folder) {

		// console.log('static config', folder);

		var future2 = Q.defer();

		FolderLoader.scanFolder(folder.src+'/**/*').then(function(allstatic) {
			// console.log('allstatic', allstatic);

			allstatic.forEach(function(sfp) {
				outputrepo.addStatic(sfp, sfp.substring(folder.src.length-1), folder.target);
			});

			future2.resolve(true);
		});

		all_static_promises.push(future2.promise);

	});

	console.log(all_static_promises);

	return Q.allSettled(all_static_promises);
}

function generateSite() {
	var future = Q.defer();
	// console.log('in generateSite');

	var Site = null;
	try {
		var fn = config.sitefolder+'/'+config.site+'/site';
		Site = require(fn).Site;
	} catch(e) {
		console.error(e);
		future.reject();
	}

	if (Site) {
		var site = new Site(config, contentrepo, templatecache, outputrepo);
		try {
			site.prepare().then(function() {
				future.resolve(true);
			});
		} catch(e) {
			console.error(e);
			future.reject();
		}
	}

	return future.promise;
}

function writeAllGeneratedFiles() {
	// console.log('in writeAllGeneratedFiles');
	return outputwriter.writeAllDocuments();
}

function copyAllStaticFiles() {
	// console.log('in copyAllStaticFiles');
	return outputwriter.copyAllStaticFiles();
}

loadAllContent()
	.then(loadAllStaticFiles)
	.then(generateSite)
	.then(writeAllGeneratedFiles)
	.then(copyAllStaticFiles)
	.then(function() { console.log('All done.'); });
