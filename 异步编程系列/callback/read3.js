var fs = require('fs')
var tasks = require('./tasks.js')

fs.readFile('t1.txt', 'utf-8', function(err, data){
  if (err) throw err;
  var names = data.replace(/\r\n|\r/g, '\n').split('\n');
  names.pop();

  tasks.map0(names, fs.readFile, function(err, results){
    if (err) throw err;

    var len = results.length;
    for (var i = 0; i < len; i++) {
      console.log(i + 2 + ': ' + results[i]);
    }
    console.log('read ok!');
  });
});
