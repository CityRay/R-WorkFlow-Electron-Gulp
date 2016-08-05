const exec = require('child_process').exec;
exec('gulp', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  // console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

// exec(`gulp ${btn.get('cmd')} --cwd ${listLocation} ${btn.get('flag')} --gulpfile ${cwd}/gulpfile.js`)
