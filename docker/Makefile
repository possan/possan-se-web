copy:
	rm -f src/*
	mkdir -p src
	#cp -R ../output/* src/
	cp -R ../temppage/dist/* src/

build: copy
	docker build -t possan-www:latest .

upload: build
	# docker tag -f www.possan.se:latest tutum.co/possan/www.possan.se:latest
	# docker push tutum.co/possan/www.possan.se:latest
	docker tag -f possan-www:latest possan/possan-www:latest
	docker push possan/possan-www:latest



