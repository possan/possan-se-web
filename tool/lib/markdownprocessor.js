var Q = require('q');
var fs = require('fs');
var wmd = require('wmd');
var path = require('path');
var glob = require('glob');
var htmlparser2 = require('htmlparser2');
var domser = require('dom-serializer');

var MarkdownProcessor = function() {
}

MarkdownProcessor.process = function(contentfolder, contentrepo, config, raw, data, outputrepo) {
	var future = Q.defer();

	// var contentfolder = path.dirname(filepath);
	console.log('Globbing contentfolder: ' + contentfolder, data);

	var contentbasefolder = path.dirname(contentfolder);

	var d;

	function updateDomChildren(domchildren) {
		domchildren.forEach(function(ch) {
			updateDomNode(ch);
		});
	}

	function updateDomNode(domnode) {
		// console.log('updating dom node', domnode.type, domnode.name, domnode.attribs);

		if (domnode.type == 'tag' && domnode.name == 'img') {
			// console.log('found image', domnode);

			var cls = domnode.attribs['class'] || '';

			var src = domnode.attribs.src;
			if (src.indexOf('://') == -1 && src.indexOf('.gif') == -1) {
				if (cls.indexOf('side') != -1) {
					var rr = outputrepo.addThumbnail(src, ['side', 'side2x'], contentbasefolder, d.metadata.target_path);
					domnode.attribs.src = rr['side'];
					// domnode.attribs['data-highres'] = rr['side2x'];
					domnode.attribs['srcset'] = rr['side'] + ' 1x, ' + rr['side2x'] + ' 2x'
				} else {
					var rr = outputrepo.addThumbnail(src, ['full', 'full2x'], contentbasefolder, d.metadata.target_path);
					domnode.attribs['class'] = (cls + ' full').trim();
					domnode.attribs.src = rr['full'];
					// domnode.attribs['data-highres'] = rr['full2x'];
					domnode.attribs['srcset'] = rr['full'] + ' 1x, ' + rr['full2x'] + ' 2x'
				}
			}
		}

		if (domnode.children) {
			updateDomChildren(domnode.children);
		}
	}


	glob(contentfolder + '/*', {}, function (er, files) {
		var attachments = [];
		var markdownfile = '';

		console.log('glob callback', files);
		files.forEach(function(f) {
			var ext = path.extname(f).toLowerCase();
			if (ext == '.md') {
				return;
			}
			var fn = path.basename(f);
			var st = fs.statSync(f);
			if (!st.isFile())
				return;
			console.log('File has related file ' + f);
			// attachments.push({
			// 	source: f,
			// 	filename: fn
			// });
		});

		console.log('got raw', raw.length);
		d = wmd(raw, {});

		d.metadata.markdown = d.markdown;
		d.metadata.attachments = attachments;
		d.metadata.contentfolder = contentfolder;
		d.metadata.target_path = data.target_path;

		console.log('d.metadata', d.metadata);

		var handler = new htmlparser2.DomHandler(function (error, dom) {
			// console.log('domhandler', error, dom);
			updateDomChildren(dom);
			// console.log('updated dom', dom);
			var newhtml = domser(dom);
			// console.log('newhtml', newhtml);
			// console.log('newhtml', d.metadata);

			d.metadata.html = newhtml;

			// d._path = filepath;

			var tmp = outputrepo.addThumbnail(d.metadata.cover, ['smallcover', 'smallcover2x'], contentbasefolder, d.metadata.target_path);
			d.metadata.coverthumb = tmp['smallcover'];
			d.metadata.coverthumb2x = tmp['smallcover2x'];

			// contentrepo.addDocument(d.metadata);

			setTimeout(function() {
				future.resolve(d.metadata);
			}, 50);
		});

		var parser2 = new htmlparser2.Parser(handler);
		parser2.write(d.html);
		parser2.done();


	});

	return future.promise;
}

exports.MarkdownProcessor = MarkdownProcessor;
