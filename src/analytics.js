// eslint-disable-next-line
const remote = require('electron').remote
const { app } = remote
const ua = require('universal-analytics')
const uuid = require('uuid/v4')
const { JSONStorage } = require('node-localstorage')

const nodeStorage = new JSONStorage(app.getPath('userData'))

// Retrieve the userid value, and if it's not there, assign it a new uuid.
const userId = nodeStorage.getItem('userid') || uuid()

// (re)save the userid, so it persists for the next app session.
nodeStorage.setItem('userid', userId)

const user = ua('UA-143405741-2', userId)

function trackEvent(category, action, label, value) {
  user
    .event({
      ec: category,
      ea: action,
      el: label,
      ev: value,
    })
    .send()
}

function trackPageview(path, title) {
  user.pageview(path, 'https://forecast.macguire.me', title).send()
}

module.exports = { trackEvent, trackPageview }