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

/**
 * Spawns a rclone process to execute with the supplied arguments.
 * @returns {ChildProcess} - the rclone subprocess.
 */
const api = function() {
  return spawn(RCLONE, Array.from(arguments));
}

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

// Rclone's `cat` needs to pipe directly to stdout.
api.cat = function() {
  return spawn(RCLONE, ["cat", ...arguments], {
    stdio: "inherit",
  });
}

// Promise-based API.
const promises = api.promises = {};

const COMMANDS = [
  "about", // Get quota information from the remote.
  "authorize", // Remote authorization.
  "backend", // Run a backend specific command.
  "check", // Checks the files in the source and destination match.
  "cleanup", // Clean up the remote if possible.
  "config", // Enter an interactive configuration session.
  "config create", // Create a new remote with name, type and options.
  "config delete", // Delete an existing remote name.
  "config disconnect", // Disconnects user from remote
  "config dump", // Dump the config file as JSON.
  "config edit", // Enter an interactive configuration session.
  "config file", // Show path of configuration file in use.
  "config password", // Update password in an existing remote.
  "config providers", // List in JSON format all the providers and options.
  "config reconnect", // Re-authenticates user with remote.
  "config show", // Print (decrypted) config file, or the config for a single remote.
  "config update", // Update options in an existing remote.
  "config userinfo", // Prints info about logged in user of remote.
  "copy", // Copy files from source to dest, skipping already copied.
  "copyto", // Copy files from source to dest, skipping already copied.
  "copyurl", // Copy url content to dest.
  "cryptcheck", // Cryptcheck checks the integrity of a crypted remote.
  "cryptdecode", // Cryptdecode returns unencrypted file names.
  "dedupe", // Interactively find duplicate filenames and delete/rename them.
  "delete", // Remove the contents of path.
  "deletefile", // Remove a single file from remote.
  "genautocomplete", // Output completion script for a given shell.
  "genautocomplete", // bash	Output bash completion script for rclone.
  "genautocomplete", // fish	Output fish completion script for rclone.
  "genautocomplete", // zsh	Output zsh completion script for rclone.
  "gendocs", // Output markdown docs for rclone to the directory supplied.
  "hashsum", // Produces a hashsum file for all the objects in the path.
  "link", // Generate public link to file/folder.
  "listremotes", // List all the remotes in the config file.
  "ls", // List the objects in the path with size and path.
  "lsd", // List all directories/containers/buckets in the path.
  "lsf", // List directories and objects in remote:path formatted for parsing.
  "lsjson", // List directories and objects in the path in JSON format.
  "lsl", // List the objects in path with modification time, size and path.
  "md5sum", // Produces an md5sum file for all the objects in the path.
  "mkdir", // Make the path if it doesn't already exist.
  "mount", // Mount the remote as file system on a mountpoint.
  "move", // Move files from source to dest.
  "moveto", // Move file or directory from source to dest.
  "ncdu", // Explore a remote with a text based user interface.
  "obscure", // Obscure password for use in the rclone config file.
  "purge", // Remove the path and all of its contents.
  "rc", // Run a command against a running rclone.
  "rcat", // Copies standard input to file on remote.
  "rcd", // Run rclone listening to remote control commands only.
  "rmdir", // Remove the path if empty.
  "rmdirs", // Remove empty directories under the path.
  "serve", // Serve a remote over a protocol.
  "serve", // dlna	Serve remote:path over DLNA
  "serve", // ftp	Serve remote:path over FTP.
  "serve", // http	Serve the remote over HTTP.
  "serve", // restic	Serve the remote for restic's REST API.
  "serve", // sftp	Serve the remote over SFTP.
  "serve", // webdav	Serve remote:path over webdav.
  "settier", // Changes storage class/tier of objects in remote.
  "sha1sum", // Produces an sha1sum file for all the objects in the path.
  "size", // Prints the total size and number of objects in remote:path.
  "sync", // Make source and dest identical, modifying destination only.
  "touch", // Create new file or change file modification time.
  "tree", // List the contents of the remote in a tree like fashion.
  "version", // Show the version number.
];

COMMANDS.forEach(commandName => {
  // Normal API command to return a subprocess.
  api[commandName] = function() {
    return api(commandName, ...arguments);
  }

  // Promise API command to return a Promise.
  promises[commandName] = function() {
    const args = Array.from(arguments);

    return new Promise((resolve, reject) => {
      const { stdout, stderr } = api(commandName, ...args);

      let output = "";
      stdout.on("data", data => {
        output += data;
      });
      stdout.on("end", () => {
        resolve(output.trim());
      });
      stderr.on("data", (data) => {
        reject(data.toString());
      });
    });
  }
});

module.exports = api;
