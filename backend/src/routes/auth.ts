import { Router } from 'express'
import { accountType } from '../middleware/auth.js'
import { userAllowedAreaIds } from '../middleware/areaAccess.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

router.get('/me', (req, res) => {
  const user = req.user!
  const name = user.username ?? 'User'
  const email = user.username ?? ''
  const allowedAreaIds = userAllowedAreaIds(req)

  return sendSuccess(res, 200, 'OK', {
    pi360: {
      usercode: user.usercode,
      name,
      email,
      username: user.username,
      account_type: accountType(user),
      designation: user.role ?? undefined,
    },
    name,
    email,
    role: accountType(user),
    designation: user.role ?? null,
    allowedAreaIds,
  })
})

export default router
