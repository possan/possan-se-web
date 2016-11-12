all: dist/index.html dist/avatar2.gif

clean:
	rm -f dist/*
	rm -f tmp/*

dist/style.min.css: src/style.less
	lessc --clean-css src/style.less >dist/style.min.css

tmp/main.js: src/main.js src/*.js
	browserify src/main.js >tmp/main.js

dist/main.min.js: tmp/main.js
	uglifyjs tmp/main.js >dist/main.min.js

dist/index.html: dist/main.min.js dist/style.min.css src/index.tmpl.html buildtemplate.js
	node buildtemplate.js >dist/index.html

dist/avatar2.gif: src/avatar2.gif
	cp src/avatar2.gif dist/avatar2.gif

# dist/avatar.png: src/avatar.png
# 	cp src/avatar.png dist/avatar.png
# 	optipng -o7 dist/avatar.png
