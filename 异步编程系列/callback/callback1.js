var fs = require('fs')
var a = 0;

fs.readFile('t1.txt', function(err, data){
  if (err) throw err;
  console.log(data.toString());
  console.log('in: ' + a);
});

a++;
console.log('out: ' + a);
