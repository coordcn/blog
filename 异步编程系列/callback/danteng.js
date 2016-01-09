function sync(str){
  console.log(str);
}

function danteng(str, callback){
  callback(str);
}

danteng('hello', sync);
