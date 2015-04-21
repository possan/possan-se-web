var Q = require('q');
var glob = require('glob');

var ContentLoader = function() {
}

ContentLoader.scanFolder = function(pattern, repo) {
	var future = Q.defer();

	console.log('Finding', pattern);

	glob(pattern, {}, function (er, files) {
		// console.log('Glob result', er, files);

		if (files) {
			future.resolve(files);
		} else {
			future.reject(null);
		}
	});

	return future.promise;
}

ContentLoader.scanFolders = function(patterns, repo) {
	var future = Q.defer();

	allfolders = patterns.map(function(pattern) {
		return ContentLoader.scanFolder(pattern, repo);
	});

	Q.allSettled(allfolders).then(function(allfolders_result) {
		// console.log('all folders settled', allfolders_result);
	});

	return future.promise;
}

var StaticLoader = function() {
}

StaticLoader.scanFolder = function(pattern, repo) {
	var future = Q.defer();

	glob(pattern, {}, function (er, files) {
		// console.log('Glob result', er, files);

		if (files) {
			future.resolve(files);
		} else {
			future.reject(null);
		}
	});

	return future.promise;
}

ContentLoader.scanFolders = function(patterns, repo) {
	var future = Q.defer();

	allfolders = patterns.map(function(pattern) {
		return ContentLoader.scanFolder(pattern, repo);
	});

	Q.allSettled(allfolders).then(function(allfolders_result) {
		// console.log('all folders settled', allfolders_result);
	});

	return future.promise;
}

exports.ContentLoader = ContentLoader;

exports.StaticLoader = StaticLoader;
