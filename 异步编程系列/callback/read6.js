var fs = require('fs')
var tasks = require('./tasks.js')

fs.readFile('t1.txt', 'utf-8', function(err, data){
  if (err) throw err;
  var names = data.replace(/\r\n|\r/g, '\n').split('\n');
  var args = {
    't2': {
      args: names[0],
      task: fs.readFile
    },
    't3': {
      args: [names[1], 'r'],
      task: fs.open
    },
    't4': {
      args: names[2],
      task: fs.stat
    }
  };

  tasks.parallel(args, function(err, results){
    if (err) throw err;

    for (var key in results) {
      console.log(key + ': ' + results[key]);
    }
    console.log('read ok!');
  });
});
