var fs = require('fs')
var tasks = require('./tasks.js')

var args = {
  't1': {
    args: ['t1.txt', 'utf-8'],
    task: fs.readFile
  },
  'map': {
    args: [
      function(results){
        var names = results.t1.replace(/\r\n|\r/g, '\n').split('\n');
        names.pop();
        return names.map(x => [x, 'utf-8']);
      },
      function(results){
        return fs.readFile;
      }
    ],
    task: tasks.map
  },
  'mapSeries': {
    args: [
      function(results){
        var names = results.t1.replace(/\r\n|\r/g, '\n').split('\n');
        names.pop();
        return names.map(x => [x, 'utf-8']);
      },
      function(results){
        return fs.readFile;
      }
    ],
    task: tasks.mapSeries
  },
  'parallel': {
    args: function(results){
      var names = results.t1.replace(/\r\n|\r/g, '\n').split('\n');
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
        },
        'map': {
          args: [
            function(res){
              var names = results.t1.replace(/\r\n|\r/g, '\n').split('\n');
              console.log(names);
              names.pop();
              return names.map(x => [x, 'utf-8']);
            },
            function(res){
              return fs.readFile;
            }
          ],
          task: tasks.map
        }
      };

      return args;
    },
    task: tasks.parallel
  }
};

tasks.series(args, function(err, results){
  if (err) throw err;

  console.log(results.t1);
  var m = results.map;
  for (var i = 0, l = m.length; i < l; i++) {
    console.log(i + 2 + ': ' + m[i]);
  }

  var ms = results.mapSeries;
  for (var j = 0, k = ms.length; j < k; j++) {
    console.log(j + 2 + ': ' + m[j]);
  }

  var p = results.parallel;
  for (var key in p) {
    console.log(key + ': ' + p[key]);
  }
  console.log('read ok!');
});
