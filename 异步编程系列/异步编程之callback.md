本文是系列文章，从异步编程最原始的回调形式谈起，最后引入异步编程的终极方案——形式同步，通过对各种方案的详细解析，让大家对异步编程各方案的优缺点有一个直观的比较。

# 1.异步编程之callback
# 2.异步编程之promise
# 3.异步编程之generator-yield
# 4.异步编程之async-await
# 5.异步编程之coroutine
# 6.异步编程之终极方案——形式同步

我刚接触异步编程的时候，对异步和回调的理解是很模糊的，我一度认为有回调函数的就是异步，回调就代表异步，异步就代表高性能。现在看起来是十分可笑的，异步，回调，高性能三者之间并没有必然的联系。异步不一定非得用回调来实现，回调只是一个相对容易理解和实现的方案。回调也不能代表异步，如果你愿意，你完全可以用回调来调用同步函数。

// example/callback/dateng.js
```js
function sync(str){
  console.log(str);
}

function danteng(str, callback) {
  callback(str);
}

danteng('hello', sync);
```

异步同样不能代表高性能，异步只在如果一件事情由自己做比交给其他人做更有效率的情况下才能获得性能加成。以nodejs基于线程池的fs模块为例，如果我们的CPU只有一个核心，在某些情况下，fs异步操作的性能未必就比同步操作性能好。opencl可以让CPU和GPU分工进行计算，是通用计算的一个解决方案，一些浏览器厂商还实现了webcl。这个技术CPU与GPU之间的协作就是异步的，如果GPU的计算量不大，但数据量很大，时间主要消耗在CPU和GPU数据拷贝上，这时的性能可能还不如直接用CPU计算。

通过这两个例子，我们可以得到以下几个结论：
1.回调只是异步实现中的一个方案，回调并不代表异步，但用回调来表达异步，相对容易理解和实现。
2.异步的本质是把事情交给擅长的，空闲的人去做，自己专心做主要任务。
3.如果异步过程中，通讯代价（锁，内存拷贝等）超过异步获得的性能好处，异步就不是必须的。

我们生活的现实世界就是一个充满异步过程的世界，我个人认为异步过程的产生是源于分工，如果某个事情不需要分工，全由一人（把其他可异步的工具如电水壶等排除）完成，异步过程也就不存在了。但我们人类非常聪明的创造了很多可异步的工具，比如电水壶，我们完全没必要一直在那里等水烧开，我们在这个时间段内可以做其他事情。电力的使用，使得人类可以与工具进行分工，我们实现的各种自动化工具的目的都是促进分工，分工使得人类与工具的异步协作大大的提高了生产效率，节约了人类大量的时间。

人类与工具的分工协作是由人主导的，工具只要执行命令，一般来说，这种异步都会获得效率上的提升。人与人之间的分工协作情况就复杂得多，如果有一个好的管理，大家分工明确，目标明确，分工是可以带来效率的提升的。但如果管理不行，每个人的职责不明确，大家没有共同的目标，随着团队人员的增加，整体效率就会下降。

我们以一个具体的例子来说明管理对人与人之间的分工协作影响情况。

某企业请某职业经理人A做总经理，该企业主要部门有财务部，市场部，设计研发部，质量部，采购部，生产部和仓库。企业市场部刚接了一比订单，交给设计研发部开始设计，设计研发部设计完成，将材料清单交给采购部和生产部，采购立即进行采购，供应商直接将原材料送到仓库，生产部由于并不知道料来全了没，不敢贸然增加外包，这批货最后生产完成已经超过合同约定的发货期限，质量部匆匆检查盖章就发货了。供应商找采购部负责人结帐，采购认为按照合同约定的时间可以结帐，开请款单给供应商，供应商找总经理签字后到财务取款。这批货到现场后客户发现内衬钢板非304，而是201，要求全部退货，并要求企业承担全部损失。总经理A知道后开始追责，市场部提供的合同文本上注明了是304钢板，设计材料清单上也是304，采购合同也是304，看来是供应商搞鬼，采购部立即找供应商，但供应商已经跑路。采购部将责任推给质量部，认为质量部没有对原材料进行验收是造成这次退货事故的主要原因。质量部认为市场部对供应商审核不严格是主要原因，而且仓库和供应商都未通知质量部，仓库表示这是惯常做法。市场部整个从天堂掉入地狱，原以为这么大单子，分红要拿到手软了，这下分红没了，客户没了，企业还损失巨大。

我们看这个企业，看似有管理，有流程，但整个管理和流程里却是漏洞百出。首先如果是需要设计的非标准产品市场部不可以单独接单，市场部应该组织设计，采购，生产与客户对订单进行评审，我们的技术水平能不能达到客户要求，我们的采购能力和生产能力能不能达到客户要求，客户有什么具体要求，这都需要确认。确认没有问题，财务确认企业资金充裕,总经理批准，这才能签合同。合同签订之后，市场部应在总经理处报备合同，让总经理知道合同签了，可以通知设计部门开始设计。设计部设计完成后不可以立即就交给采购和生产，而是交给市场部让客户确认，客户签字认可后，市场部再到总经理处报备。接下来，如果有预付款，就要等财务确认预付款到账，总经理确认后才可交给采购部和生产部继续。采购部事前就应该建立起主要原材料的合格供应商名单，合格供应商名单应该由总经理和采购部共同确认，进行比价选择最合适的供应商，供应商原材料送达需要质量部，采购部，仓库在场，共同对质量和数量进行核验，合格才能入库，否则走退货流程。仓库到货要立即通知生产来料信息，让生产可以按照来料数量配给人手。质量部对质量应该事前，事中，事后各阶段控制，而不是发货前盖章。质量部应根据产品设置检验台账，来料检验，过程检验，成品检验，中间发生问题，检验不合格，如何处理的要有记录，不可盖章走过场。

上面的流程如果用程序来做一个抽象的话，我认为最好的模式可能是观察着模式，拿总经理为例，总经理有几个主要关注点，市场部的业务，财务部的钱，采购部的供应商资格，质量部的最终质量报告。总经理的这几个关注点可以注册（要求各部门及时上报）相应的事件到各部门，各部门在一定条件下触发这些事件，然后这些事件又推动了工作流程向前走，总经理这个时候在公司中主要起到了建设流程，推动流程，监督流程的作用。

虽然这个企业是一个假设的例子，流程经过改进后其实还是不完善的，比如缺少设计变更，返工等需要回朔的流程。但这并不影响我们得出这么一个结论，企业的运行是可以基于回调的，各部门的异步协作通过回调来保证执行顺序。进一步的，我们认为回调是保证顺序执行的。

只有真正的区分的回调和异步才能真正的理解异步的本质。回调并不代表异步，更不是异步，回调恰恰是用来修补异步可能造成的错误，保证顺序执行，保证同步的。如果不相干的事情，虽然是异步的，不保证顺序也不会出现错误，这个时候回调的作用只剩下取得异步返回值了。现实世界，尤其是编程实现某些工作的时候，这些事情大多是相干的，是互相影响，有先后顺序关系的，为了克服异步带来的不确定性，回调必须被引入来保证执行顺序。由此我们得出异步编程里的第一个大矛盾，异步不能保证相干事件按照预定顺序运行，我们需要回调等手段来保证逻辑同步。

下面的系列代码可以帮助你更好的理解异步执行过程。这个系列是渐进增强的，每个小程序运行结束后，对照输出，异步的执行过程就非常清晰了。

example/callback/callback1.js
```js
var fs = require('fs')
var a = 0;

fs.readFile('t1.txt', function(err, data){
  if (err) throw err;
  console.log(data.toString());
  console.log('in: ' + a);
});

a++;
console.log('out: ' + a);
```

example/callback/callback2.js
```js
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
```

example/callback/callback3.js
```js
var fs = require('fs')
var a = 0;

for (var i = 1; i < 5; i++) {
  fs.readFile('t' + i + '.txt', function(err, data){
    if (err) throw err;
    a++;
    console.log(data.toString());
    console.log('in a t1: ' + a);
    console.log('in i t1: ' + i);
  });
  
  console.log('out i: ' + i);
}

a++;
console.log('out a: ' + a);
```

example/callback/callback4.js
```js
var fs = require('fs')
var a = 0;

for (var i = 1; i < 5; i++) {
  (function(ii){
    fs.readFile('t' + i + '.txt', function(err, data){
      if (err) throw err;
      a++;
      console.log(data.toString());
      console.log('in a t1: ' + a);
      // 这里实现了一个自运行函数，由于函数参数都是按值传递的，所以i的结果和callback3.js的是不一样的，注意比较。
      console.log('in i t1: ' + ii);
    });
  })(i);
  
  console.log('out i: ' + i);
}

a++;
console.log('out a: ' + a);
```

也许到这里，大家越来越看不懂这篇文章了，一个简单的异步回调可以讲这么多废话。抛开所有的废话，我的核心观点其实很简单，回调是用来保证逻辑顺序的，回调和异步本质上没有任何关系。我们调用异步函数，本质上只是发起了某个异步命令（多数由系统层面提供），并注册了这个异步命令完成后的回调函数。在下一个事件周期，如果异步命令完成，回调就被触发。解释了这么多，很多人可能还没明白回调和异步为什么没有任何关系。我举个极端的例子，我不关心异步的逻辑顺序也不关心异步的返回值，在这种情况下，回调就可以被省略，在C里面就是一个NULL。很多人可能要说，我还是要返回值的，我认为你只要关心返回值，你就是在关心逻辑顺序，因为这个返回值必然是异步完成之后获得的，如果你真的不关心逻辑顺序，要获得返回值最偷懒的办法就是设置一个全局变量，但反过来，可以证明，你只要关心返回值，你就是关心逻辑顺序的。从而证明了回调就是用来保证逻辑顺序的。

只有把回调和异步彻底的脱钩，才有可能更好的理解异步，更好的理解回调的真正作用。异步和回调单独开其实都很简单，但真正困难的是两者结合在一起，并有逻辑顺序需要保证的时候，由其这个逻辑顺序非常复杂的时候。接下来我们就开始正式解决这个问题，我们会从最原始的回调保证逻辑顺序开始讲，到最后给出一个终极的解决方案。

我们将异步问题抽象为两个主要问题，一是解决顺序逻辑问题，二是解决所谓并行问题。顺序逻辑问题的异步操作是存在先后关系的，并行是没有先后关系。我们以读取文件来模拟异步过程，t1.txt存放了三个文件（t2.txt,t3.txt,t4.txt）的文件名，我们假设必须先读取t1.txt才知道三个文件名称，然后再读出三个文件的内容，我们分别要求并行读取和顺序读取，并在读取完成后报告读取完成。

example/callback/read1.js
```js
var fs = require('fs')

fs.readFile('t1.txt', 'utf-8', function(err, data){
  if (err) throw err;
  var names = data.replace(/\r\n|\r/g, '\n').split('\n');
 
  var len = names.length - 1;
  var completed = 0;
  for (var i = 0; i < len; i++) {
    (function(ii){
      fs.readFile(names[i], 'utf-8', function(err, data){
        if (err) throw err;
        console.log(ii + 2 + ': ' + data);
        completed++;
        if (completed == len) {
          console.log('read ok!');
        }
      });
    })(i);
  }
});
```

example/callback/read2.js
```js
var fs = require('fs')

fs.readFile('t1.txt', 'utf-8', function(err, data){
  if (err) throw err;
  var names = data.replace(/\r\n|\r/g, '\n').split('\n');
 
  var len = names.length - 1;
  var completed = 0;

  var iterate = function(){
    name = names[completed];
    fs.readFile('name, 'utf-8', function(err, data){
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
```

read1.js是并行读取而read2.js是顺序读取的，如果我们使用callback来保证异步执行的顺序，这两种模式将是我们经常碰到的，既然是经常的，我们就试着将这些方法抽象出来，成为一些通用的方法。

我们顺着具体的需求一步步来实现基于callback的异步流程控制通用方法。

example/callback/tasks.js
```js
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
```

task.map0可以通用的解决read1.js并行读取三个文件的问题
example/callback/read3.js
```js
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
```

task.map0虽然可以解决一些问题，但还是有些局限，比如我们调用的异步函数参数超过两个的时候，我们就要自己做一些转换。
```js
function task(item, callback){
  fs.readFile(item, 'utf-8', function(err, data){
    callback(err, data);
  });
}
```

为了避免不必要的转换，我们再将tasks.map0做一下改进。
```js
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

    if (!x) {
      x = [cb];
    } else if (Array.isArray(x)) {
      x.push(cb);
    } else {
      x = [x, cb];
    }

    task.apply(ctx, x);
  });
};
```

改进后的tasks.map(arr, task, done)对异步函数的参数个数已经不再挑剔，arr内可以是单个值也可以是数组，具体的应用可以参看read4.js。

接下来的代码在本质上都是一样的，就不一一列出了，具体实现在callback/tasks.js文件内。
tasks.map(arr, task, done)解决同种异步调用并行执行问题，使用参考callback/read4.js。
tasks.mapSeries(arr, tasck, done)解决同种异步调用顺序执行问题，使用参考callback/read5.js。
tasks.parallel(obj, done)解决不同异步调用并行执行问题，使用参考callback/read6.js。
tasks.series(obj, done)解决不同异步调用顺序执行问题，使用参考callback/read7.js。

tasks最开始是我学async的时候参考async实现的一个简化版，写这篇文章的时候又加了一点新的想法进去，完成这篇文章之后我对tasks进行了整理，更新到原tasks项目，新老版本的代码都保留着。随着promise，generator的普及，这些代码现在已经没有什么价值了。但纯粹的回调异步代码我认为还是要会写，而且应该要写得很熟练。学习编程最好的方式就是看别人的代码，看懂了然后自己实现一个，有能力的话自己做一些改进。千万不要被不要重复造轮子的教条给束缚了，不重复造轮子是对工程而言的，对学习而言，我们应该鼓励造轮子。功力达到一定程度后，工程上也要敢于造轮子。很多时候感觉代码似乎看懂了，如果自己没有实现一遍，没有调式一遍，所谓的懂很多是表面的，所以我个人认为最好的学习方法就是看到别人好的功能，好的代码，自己也试着实现一个，哪怕是简化版的，刚开始可能要看别人的代码，随着学习的深入，自己逐步就会有自己的想法，水平自然而然的就提升了。自己实现过一遍，对别人代码的使用也会得心应手得多，因为你自己实现的过程，不但熟悉了API和代码结构，对设计者的设计思路也会有一个全面的了解，这样一旦碰到问题，调试起来就比较容易定位。

最后分享一个我的观点：
**我始终认为，做技术不能迷信，不能盲从，一定要有自己的思考，即便一开始是错的，但有自己的独立思考就是一个好的开端。**
