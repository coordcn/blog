var fs = require('fs')

fs.readFile('t1.txt', 'utf-8', function(err, data){
  if (err) throw err;
  var names = data.replace(/\r\n|\r/g, '\n').split('\n');
 
  var len = names.length - 1;
  var completed = 0;

  var iterate = function(){
    name = names[completed];
    fs.readFile(name, 'utf-8', function(err, data){
      if (err) throw err;
      console.log(completed + 2 + ': ' + data);
      completed++;
      if (completed == len) {
        console.log('read ok!');
      } else {
        iterate()
      }
    });
  }

  iterate();
});
