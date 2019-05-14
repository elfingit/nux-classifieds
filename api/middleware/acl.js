
const acl = (req, res, next) => {

  const { verify_token } = require('../lib/token')
  const userModel = require('../models/User')

  const debug = require('debug')('api:middleware:acl')
  debug.log = console.log.bind(console)

  new Promise((resolve, reject) => {

    if (!req.signedCookies || !req.signedCookies.token) {
      return reject(new Error('Not token in cookies'))
    }

    const payload = verify_token(req.signedCookies.token)

    if (!payload) {
      return reject(new Error('Payload is empty'))
    }

    userModel.byId(payload.id).then((u) => {
      u.role().then((r) => {
        if (r.get('name').toLowerCase() === 'admin') {
          return resolve()
        } else {
          return reject(new Error('Bad user role'))
        }
      }).catch((e) => {
        return reject(e)
      })
    }).catch((e) => {
      return reject(e)
    })
  }).then(() => {
    return next()
  }).catch((e) => {
    debug(e.message)
    return res.status(403).end()
  })

}

module.exports = acl
