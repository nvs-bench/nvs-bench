lint: 
	ruff check . --fix

format:
	ruff format .

push-boilerplate:
	git subtree split --prefix=boilerplate -b boilerplate-branch && git push origin boilerplate-branch

run-website:
	cd website && pnpm dev