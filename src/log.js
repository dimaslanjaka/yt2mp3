const fs = require('fs');

class log {
  pdleft(val) {
    if (val >= 10)
      return val;
    else
      return '0' + val;
  }
  currdate(set = false) {
    var d = new Date(),
      dformat = [(this.pdleft(d.getDate() + 1)),
        this.pdleft(d.getMonth()),
        d.getFullYear()
      ].reverse().join('/') + ' ' + [this.pdleft(d.getHours()),
        this.pdleft(d.getMinutes()),
        this.pdleft(d.getSeconds())
      ].join(':');
    console.log(dformat);
    if (!set) {
      return dformat;
    } else if (set == 'timestamp') {
      return d.getTime();
    } else if (set == 'locale') {
      return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta'
      });
    }
  }
  logging(file_mp3) {
    fs.readFile('tmp/saved.log', 'utf8', function(err, data) {
      if (err) {
        //throw err;
      };
      let obj = (err ? {} : JSON.parse(data));
      obj[file_mp3] = {
        id: file_mp3.replace(/\.\/tmp\/|\.mp3/gm, ''),
        path: file_mp3,
        date: this.currdate('locale'),
        timestamp: this.currdate('timestamp')
      }
      fs.writeFile('./tmp/saved.log', JSON.stringify(obj, null, 2), {
        overwrite: true
      }, function(err) {
        if (err) {
          //throw err;
        };
        //console.log('It\'s saved!');
      });
    });
  }
}