var fs = require('fs');

var js = fs.readFileSync('dist/main.min.js');
var css = fs.readFileSync('dist/style.min.css');
var template = fs.readFileSync('src/index.tmpl.html');

var html = template
	.toString()
	.replace('/* JS INCLUDE */', js)
	.replace('/* CSS INCLUDE */', css)
	.replace(/[\n\r\t]+/g,' ')
	.replace(/[ ]{2,}/g,' ');

console.log(html);
