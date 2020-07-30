const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
module.exports = function (port) {
  const open = require("open");
  rl.question(
    `Want to open ${url} ? ` + "\n (y/yes) to open, type any for cancel: \t",
    async function (yes) {
      if (/^(y|yes)$/s.test(yes)) {
        await open(`http://127.0.0.1:${port}`);
      }
    }
  );
  setTimeout(function () {
    rl.close();
  }, 10000);
};
