var fs = require('fs'),
    util = require('util'),
    inspect = util.inspect,
    colors = require('colors'),
    spawn = require('child_process').spawn;



delay = function() {
   restart_id = setTimeout(start, delay_wait)
}

start = function() {
  log('\nMonitoring the following files for changes:\n' + inspect(files) + '\n');    
  log('STARTING NEW CHILD', 'log');
  restart_id = 0;
  child = spawn(cmd, args, {customFds: [1, 1, 1]});
  
  var launched = (new Date).getTime(),
      pid = child.pid;
      
  log('NEW CHILD PID ' + pid + '\n', 'log');
  child.on('exit', function() {
    log('\nCHILD EXITED: ' + pid + '\n', 'log');
    crashed = (((new Date).getTime() - launched) < crashThreshhold);
    if(crashed) {
          restart_count += 1;
          if(restart_count < max_crash_restart) {
              log('process crashed. Retry count: ' + restart_count, 'warn');
              delay();
          } else {
              log('process crashed, waiting for file change', 'warn');
          }
    } else {
        restart_count = 0;
        start();
    }
  }); 
};

process.on('SIGINT', function() {
  child.kill('SIGHUP');
  process.exit(0);
});

process.on('uncaughtException', function (err) {
  console.error('\n' + err.stack.bold.red + '\n');
  child.kill('SIGHUP');
  process.exit();
});
