var fs = require('fs')

var a = 0;

for (var i = 1; i < 5; i++) {
  (function(ii){
    fs.readFile('t' + i + '.txt', function(err, data){
      if (err) throw err;
      a++;
      console.log(data.toString());
      console.log('in a t1: ' + a);
      console.log('in i t1: ' + ii);
    });
  })(i);
  
  console.log('out i: ' + i);
}

a++;
console.log('out a: ' + a);
