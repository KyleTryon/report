const util = require('util')
const fs = require('fs')
const webpack = require('webpack')
const PacktrackerPlugin = require('@packtracker/webpack-plugin')

let config = {}
if (fs.lstatSync(process.env.WEBPACK_CONFIG_PATH).isFile()) {
  config = require(process.env.WEBPACK_CONFIG_PATH)
}

config.plugins = config.plugins || []

if (process.env.GITHUB_EVENT_PATH) {
  config.plugins.push(new PacktrackerPlugin(githubConfig()))
} else if (process.env.CIRCLECI) {
  config.plugins.push(new PacktrackerPlugin(circleConfig()))
}

webpack(config, (err) => {
  if (err) {
    process.exit(1)
  } else {
    process.exit(0)
  }
})

function githubConfig () {
  const event = require(process.env.GITHUB_EVENT_PATH)
  console.log(util.inspect(event))
  return {
    upload: true,
    fail_build: true,
    branch: event.ref.replace('refs/heads/', ''),
    author: event.head_commit.author.email,
    message: event.head_commit.message,
    commit: process.env.GITHUB_SHA,
    committed_at: parseInt(+new Date(event.head_commit.timestamp) / 1000),
    prior_commit: event.before,
  }
}

function circleConfig () {
  return {
    upload: true,
    fail_build: true,
    branch: process.env.CIRCLE_BRANCH,
    commit: process.env.CIRCLE_SHA1,
  }
}
