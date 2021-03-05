#!/usr/bin/env node

const api = require("../index.js");

const [/** node **/, /** file **/, commandName, ...args] = process.argv;

// "update" command is not a rclone command.
if (commandName === "update") {
  return api.update(...args);
}

// Executes rclone command if available.
/** @type {(...args: any[]) => ChildProcess } */
const { [commandName]: command } = api;

const subprocess = command ? command(...args) : api(commandName, ...args);

subprocess.stdout.on("data", (data) => {
  console.log(data.toString());
});

subprocess.stderr.on("data", (data) => {
  console.error(data.toString());
});
