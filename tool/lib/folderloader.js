var Q = require('q');
var glob = require('glob');

var FolderLoader = function() {}

FolderLoader.scanFolder = function(pattern) {
	var future = Q.defer();

	// console.log('scanFolder', pattern);

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

FolderLoader.scanFolders = function(patterns) {
	var future = Q.defer();

	// console.log('scanFolders', patterns);

	var allfolders = patterns.map(function(pattern) {
		return FolderLoader.scanFolder(pattern);
	});

	Q.allSettled(allfolders).then(function(allfolders_result) {
		// console.log('all folders settled', allfolders_result);
		var all_files = [];
		allfolders_result.forEach(function(result) {
			if (result.state == 'fulfilled') {
				all_files = all_files.concat(result.value);
			}
		});
		future.resolve(all_files);
	});

	return future.promise;
}

exports.FolderLoader = FolderLoader;
