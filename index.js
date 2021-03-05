const { join } = require("path");
const { spawn, ChildProcess } = require("child_process");

let { platform, arch } = process;

switch (platform) {
  case "darwin":
    platform = "osx";
    break;
  case "freebsd":
  case "linux":
  case "openbsd":
    break;
  case "sunos":
    platform = "solaris";
  case "win32":
    platform = "windows";
  default:
    break;
}

switch (arch) {
  case "arm":
  case "arm64":
  case "mips":
  case "mipsel":
    break;
  case "x32":
    arch = "386";
  case "x64":
    arch = "amd64";
  default:
    break;
}

const RCLONE_DIR = join(__dirname, "bin");
const RCLONE = join(RCLONE_DIR, `rclone${ platform === "windows"? ".exe" : "" }`);

const api = {};

/**
 * Updates rclone binary based on current OS.
 * @returns {Promise}
 */
api.update = async function() {
  const { chmodSync } = require("fs");

  const fetch = require("node-fetch");
  const AdmZip = require("adm-zip");

  console.log("Downloading latest rclone...");

  return fetch(`https://downloads.rclone.org/rclone-current-${ platform }-${ arch }.zip`)
  .then(response => response.buffer())
  .then(buffer => {
    console.log("Extracting rclone...");

    const zip = new AdmZip(buffer);

    var zipEntries = zip.getEntries();

    zipEntries.forEach((entry) => {
      if (/rclone(\.exe)?$/.test(entry.name)) {
        zip.extractEntryTo(entry, RCLONE_DIR, false, true);
        // Make it executable.
        chmodSync(RCLONE, 0o755);

        console.log(`${ entry.entryName } is installed.`);
      }
    });
  });
}

module.exports = api;
