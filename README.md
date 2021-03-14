# Rclone.js

The JavaScript API to the "Swiss army knife of cloud storage"
[rclone](https://rclone.org/).

Besides providing a way to install rclone on different platforms, a CLI and
a JavaScript API are included.

## Installation

```sh
npm install rclone.js
```

After installation, the latest binary of `rclone` is also fetched based on
your system environment.

## Usage

### Node.js

Except `update` (which is used to update `rclone` binary), all API functions
return a child process whose events we can listen to.

```js
const rclone = require("rclone.js");

const ls = rclone.ls("source:");

ls.stdout.on("data", (data) => {
  console.log(data.toString());
});

ls.stderr.on("data", (data) => {
  console.error(data.toString());
});
```

There is also a Promise-based API:

```js
const rclone = require("rclone.js").promises;

(async function() {
  const results = await rclone.ls("source:");
  console.log(results);
})();
```

### CLI

This simple CLI calls the JS API above and outputs `stdout` and `stderr`.

```sh
$ npx rclone --version
rclone v1.54.0
- os/arch: darwin/amd64
- go version: go1.15.7
```

```sh
$ npx rclone ls source:
          -1 2020-12-12 10:01:44        -1 Documents
          -1 2020-12-11 16:24:20        -1 Pictures
```
