#!/usr/bin/env node
const mri = require("mri");

const rclone = require("../");

const {_: args, ...flags} = mri(process.argv.slice(2));
const [commandName, ...commandArguments] = args;

// "update" is not a rclone command.
if (commandName === "update") {
  return rclone.update(...commandArguments, flags);
}

// Executes rclone command if available.
const { [commandName]: command } = rclone;

const subprocess = command ?
      command(...commandArguments, flags) :
      rclone(...args, flags);

subprocess.stdout?.on("data", (data) => {
  console.log(data.toString());
});

subprocess.stderr?.on("data", (data) => {
  console.error(data.toString());
});
