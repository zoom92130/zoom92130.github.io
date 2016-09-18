Zoom 92130
----------

This is zoom 92130 photoclub prototype, served by github pages

Develop the website
-------------------

docker run --name jekyll -v $PWD:/srv/jekyll -p 80:4000 jekyll/jekyll jekyll serve --trace --watch --profile --drafts --config _config.yml,_config.local.yml


Publish the website
-------------------

Push you copy on github repository:
`git push origin master`

Access the website
------------------

https://zoom92130.github.io
