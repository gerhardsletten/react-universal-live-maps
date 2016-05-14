import jwt from 'jsonwebtoken'
import config from '../../src/config'

function login (req, res) {
  if (req.body.username === config.username && req.body.password === config.password) {
    const user = {
      username: req.body.username
    }
    const token = jwt.sign(user, config.tokenSecret, {
      expiresIn: `${config.sessionTimeoutDays} days`
    })
    req.session.user = token
    res.json(user)
  } else {
    res.status(403).json({error: 'Username or password is wrong'})
  }
}

function logout (req, res) {
  req.session.destroy(() => {
    req.session = null
    res.json(null)
  })
}

function decodeToken (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.tokenSecret, (err, decoded) => {
      if (err) {
        return reject(null)
      }
      resolve(decoded)
    })
  })
}

function loadAuth (req, res) {
  decodeToken(req.session.user)
  .then((user) => res.json(user))
  .catch((err) => res.json(err))
}

function requireAuth (req, res, next) {
  const token = req.session.user || req.body.token || req.query.token || req.headers['x-access-token']
  if (token) {
    decodeToken(token)
      .then((user) => {
        req.user = user
        next()
      })
      .catch((err) => {
        console.log(err)
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        })
      })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
  }
}

const User = {
  login,
  logout,
  loadAuth,
  requireAuth
}
export default User
