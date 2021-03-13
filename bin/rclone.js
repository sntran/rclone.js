#!/usr/bin/env node

const rclone = require("../");

const [/** node **/, /** file **/, commandName, ...args] = process.argv;

// "update" is not a rclone command.
if (commandName === "update") {
  return rclone.update(...args);
}

// Executes rclone command if available.
const { [commandName]: command } = rclone;

const subprocess = command ? command(...args) : rclone(commandName, ...args);

subprocess.stdout?.on("data", (data) => {
  console.log(data.toString());
});

subprocess.stderr?.on("data", (data) => {
  console.error(data.toString());
});
