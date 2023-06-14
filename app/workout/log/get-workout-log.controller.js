import asyncHandler from 'express-async-handler'
import { prisma } from '../../prisma.js'
import { calculateMinute } from '../calculate-minute.js'

// @desc   Get workout log
// @route  GET /api/workouts/log/:id
// @access Private
export const getWorkoutLog = asyncHandler(async (req, res) => {
	const workoutLog = await prisma.workoutLog.findUnique({
		where: {
			id: +req.params.id
		},
		include: {
			workout: {
				include: {
					exercises: true
				}
			},
			exerciseLogs: {
				orderBy: {
					id: 'asc'
				},
				include: {
					exercise: true
				}
			}
		}
	})

	if (!workoutLog) {
		res.status(404)
		throw new Error('Workout log not found!')
	}

	// const prevWorkoutLog = await prisma.workoutLog.findFirst({
	// 	where: {
	// 		workoutId: workoutLog.workoutId, // !!!!!!!!!!!!!!!!!!!!
	// 		userId: +req.user.id,
	// 		isCompleted: true
	// 	},
	// 	orderBy: {
	// 		createdAt: 'desc'
	// 	},
	// 	include: {
	// 		times: true
	// 	}
	// })

	// let newTimes = addPrevValues(workoutLog, prevWorkoutLog)
	res.json({
		...workoutLog,
		minute: calculateMinute(workoutLog.workout.exercises.length)
	})
})
