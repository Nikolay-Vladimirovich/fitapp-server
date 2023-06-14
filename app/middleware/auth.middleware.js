import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma.js'
import { UserFields } from '../utils/user.utils.js'

export const protect = asyncHandler(async (req, res, next) => {
	let token = null;
	if (req.headers.authorization?.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1]

		

		// Декодируем токен, что бы затем вытащить из него id
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		const userFound = await prisma.user.findUnique({
			where: {
				id: decoded.userId
			},
			select: UserFields
		})

		if (userFound) {
			req.user = userFound
			next()
		} else {
			// Если пользователя нет
			res.status(401)
			throw new Error('Not authorized, token failed')
		}

		// Если токена нет
		if (!token) {
			res.status(401)
			throw new Error('Not authorized. I do not have a token')
		}
	}
})
