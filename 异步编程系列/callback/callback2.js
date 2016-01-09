var fs = require('fs')
var a = 0;

fs.readFile('t1.txt', function(err, data){
  if (err) throw err;
  console.log(data.toString());
  console.log('in: ' + a);
});

for (var i = 0; i < 10000; i++) {
  console.log(i);
}

a++;
console.log('out: ' + a);
