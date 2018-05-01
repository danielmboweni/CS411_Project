BIN = ./node_modules/.bin
SRC = ./src/
LIB = ./lib/

es6:
	@babel $(SRC) --out-dir $(LIB)

watch-es6:
	@babel --watch $(SRC) --out-dir $(LIB) --source-maps

test: test-unit test-functional

test-unit:
	$(BIN)/mocha --require should --reporter spec test/unit/client.js

test-functional:
	@karma start client.conf.js

karma-start:
	@karma start client.conf.js

karma-run:
	@karma run client.conf.js

start:
	@node server.js

fixture:
	@node ./test/fixtures --${MAKECMDGOALS}