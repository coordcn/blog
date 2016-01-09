var tasks = {}

tasks.map0 = function(arr, task, done){
  var length = arr.length;
  if (length < 1 || !task) return;
  done = done || function(){};

  var results = [];
  var completed = 0;

  arr.forEach(function(x, i){
    task(x, function(err, result){
      if (err) {
        done(err);
        done = function(){};
      } else {
        results[i] = result;
        completed++;
        if (completed == length) {
          done(null, results);
        }
      }
    });
  });
};

/* @function tasks.map(arr, task, done) 并行执行相同的异步函数
 * @param arr {array} task除回调函数之外的参数，参数大于一个时用数组表示
 * @param task {function} 异步函数
 * @param done {function} 全部执行完成后调用的回调函数
 * @example
 *  var args = [
 *    ['t1.txt', 'utf-8'],
 *    't2.txt'
 *  ];
 *  tasks.map(args, fs.readFile, function(err, reuslts){
 *    if(err){
 *      console.log(err);;
 *    }else{
 *      for (var i = 0, len = result.length; i < len; i++) {
 *        console.log(results[i]);
 *      }
 *    }
 *  });
 */
tasks.map = function(arr, task, done){
  var length = arr.length;
  if (length < 1 || !task) return;
  done = done || function(){};

  var ctx = this;
  var results = [];
  var completed = 0;

  arr.forEach(function(x, i){
    var cb = function(err, result){
      if (err) {
        done(err);
        done = function(){};
      } else {
        results[i] = result;
        completed++;
        if (completed == length) {
          done(null, results);
        }
      }
    };

    var args = x;
    if (!args) {
      args = [cb];
    } else if (Array.isArray(args)) {
      args = args.map(item => typeof item == 'function' ? item(results) : item);
      args.push(cb);
    } else {
      args = [typeof args === 'function' ? args(results) : args, cb];
    }

    task.apply(ctx, args);
  });
};

/* @function tasks.mapSeries(arr, task, done) 顺序执行相同的异步函数 （注：各步异步结果无依赖关系）
 * @param arr {array} task除回调函数之外的参数，参数大于一个时用数组表示
 * @param task {function} 异步函数
 * @param done {function} 全部执行完成后调用的回调函数
 * @example
 *  var args = [
 *    ['t1.txt', 'utf-8'],
 *    't2.txt'
 *  ];
 *  tasks.mapSeries(args, fs.readFile, function(err, reuslts){
 *    if(err){
 *      console.log(err);;
 *    }else{
 *      for (var i = 0, len = result.length; i < len; i++) {
 *        console.log(results[i]);
 *      }
 *    }
 *  });
 */
tasks.mapSeries = function(arr, task, done){
  var length = arr.length;
  if (length < 1 || !task) return;
  done = done || function(){};

  var ctx = this;
  var results = [];
  var completed = 0;

  var iterate = function(){
    var cb = function(err, result){
      if (err) {
        done(err);
        done = function(){};
      } else {
        results[completed] = result;
        completed++;
        if (completed == length) {
          done(null, results);
        } else {
          iterate();
        }
      }
    };

    var args = arr[completed];
    if (!args) {
      args = [cb];
    } else if (Array.isArray(args)) {
      args = args.map(item => typeof item == 'function' ? item(results) : item);
      args.push(cb);
    } else {
      args = [typeof args === 'function' ? args(results) : args, cb];
    }

    task.apply(ctx, args);
  };

  iterate();
};

/* @function tasks.parallel(obj, done) 并行执行不同的异步函数
 * @param obj {object} 
 *  var obj = {
 *    't1': {
 *      args: ['t1.txt', 'utf-8'], 异步函数除回调函数之外的参数，参数大于一个时用数组表示
 *      task: asyncFun1 异步函数
 *    },
 *    't2': {
 *      args: 't1.txt',
 *      task: asyncFun2
 *    }
 *  };
 * @param done {function} 全部执行完成后调用的回调函数
 * @example
 *  var obj = {
 *    't1': {
 *      args: ['t1.txt', 'utf-8'],
 *      fs.readFile
 *    },
 *    't2': {
 *      args: 't2.txt',
 *      fs.open
 *    }
 *  };
 *  tasks.parallel(obj, function(err, reuslts){
 *    if(err){
 *      console.log(err);;
 *    }else{
 *      for (var name in results) {
 *        console.log(results[name]);
 *      }
 *    }
 *  });
 */
tasks.parallel = function(obj, done){
  var keys = Object.keys(obj);
  var length = keys.length;
  if (length < 1) return;
  done = done || function(){};

  var ctx = this;
  var results = [];
  var completed = 0;

  keys.forEach(function(key){
    var cb = function(err, result){
      if (err) {
        done(err);
        done = function(){};
      } else {
        results[key] = result;
        completed++;
        if (completed == length) {
          done(null, results);
        }
      }
    };

    var task = obj[key];
    console.log(task.args);
    console.log(task.task);
    var args = task.args;
    if (!args) {
      args = [cb];
    } else if (Array.isArray(args)) {
      args = args.map(item => typeof item == 'function' ? item(results) : item);
      args.push(cb);
    } else {
      args = [typeof args === 'function' ? args(results) : args, cb];
    }

    task.task.apply(ctx, args);
  });
};

/* @function tasks.series(tasks, done) 顺序执行不同的异步函数 (注：各步异步结果之间可存在依赖关系)
 * @param obj {object} 
 *  var obj = {
 *    't1': {
 *      args: ['t1.txt', 'utf-8'], 异步函数除回调函数之外的参数，参数大于一个时用数组表示
 *      task: asyncFun1 异步函数
 *    },
 *    't2': {
 *      args: function(results){return results[t1];}, 如果参数为函数则传入results执行
 *      task: asyncFun2
 *    }
 *  };
 * @param done {function} 全部执行完成后调用的回调函数
 * @example
 *  var args = [
 *    't1': {
 *      args: ['t1.txt', 'utf-8'],
 *      fs.readFile
 *    },
 *    't2': {
 *      args: function(results){return results[t1];},
 *      fs.open
 *    }
 *  ];
 *  tasks.series(args, function(err, reuslts){
 *    if(err){
 *      console.log(err);;
 *    }else{
 *      for (var name in results) {
 *        console.log(results[name]);
 *      }
 *    }
 *  });
 */
tasks.series = function(obj, done){
  var keys = Object.keys(obj);
  var length = keys.length;
  if (length < 1) return;
  done = done || function(){};

  var ctx = this;
  var results = [];
  var completed = 0;

  var iterate = function(){
    var key = keys[completed];
    var cb = function(err, result){
      if (err) {
        done(err);
        done = function(){};
      } else {
        results[key] = result;
        completed++;
        if (completed == length) {
          done(null, results);
        } else {
          iterate();
        }
      }
    };

    var task = obj[key];
    var args = task.args;
    if (!args) {
      args = [cb];
    } else if (Array.isArray(args)) {
      args = args.map(item => typeof item == 'function' ? item(results) : item);
      args.push(cb);
    } else {
      args = [typeof args === 'function' ? args(results) : args, cb];
    }

    task.task.apply(ctx, args);
  };

  iterate();
};

module.exports = tasks;
