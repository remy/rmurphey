#!/usr/bin/env node

var fs = require('then-fs');
var path = require('path');
var dir = __dirname + '/../public/blog';
var yaml = require('js-yaml');

fs.readdir(dir).then(function (files) {
  var filenames = files.filter(_ => _.indexOf('.md') !== -1)
    .map(_ => dir + '/' + _);
    // .slice(0, 1);
  // console.log(filenames);
  var promises = filenames.map(_ => fs.readFile(_, 'utf8'));

  var slugRe = /(\d{4})-(\d{2})-(\d{2})-([\W\w]*?)\.md/i;
  return Promise.all(promises).then(files => {
    var promises = [];
    var data = files.map((str, i) => {
      var filename = path.basename(filenames[i]);
      console.log(filename);
      var lines = str.split('\n'); // fucking failing regexp
      var yamldata = null;
      for (var j = 0; j < lines.length; j++) {
        if (lines[j].trim() === '---') {
          if (yamldata === null) {
            yamldata = '';
            continue;
          } else {
            break; // we've got everything
          }
        }

        if (yamldata !== null) {
          yamldata += lines[j] + '\n';
        }
      }

      var data = yaml.safeLoad(yamldata);
      var body = '# ' + data.title + '\n' + lines.slice(j+1).join('\n');

      var slug = slugRe.exec(filename);
      promises.push(fs.writeFile(dir + '/' + slug[4] + '.md', body));

      data.slug = slug[4];
      data.published = true;
      data.filename = dir + '/' + slug[4] + '.md';
      var backup = [slug[1], slug[2], slug[3]].join('-');
      data.date = new Date(data.date || backup).toJSON().replace('T', ' ').replace('.000Z', '');
      delete data.layout;
      return data;
    }).filter(Boolean).reduce((acc, curr) => {
      var slug = curr.slug;
      delete curr.slug;
      acc[slug] = curr;
      return acc;
    }, {});

    promises.push(fs.writeFile(dir + '/_data.json', JSON.stringify(data, '', 2)));
    return Promise.all(promises);
  });
}).catch(e => {
  console.log(e.stack);
});