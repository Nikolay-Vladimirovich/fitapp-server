import asyncHandler from 'express-async-handler'
import { prisma } from '../../prisma.js'

// @desc   Create new workout log
// @route  POST /api/workouts/log/:id
// @access Private
export const createNewWorkoutLog = asyncHandler(async (req, res) => {
	const workoutId = +req.params.id

	const workout = await prisma.workout.findUnique({
		where: {
			id: workoutId
		},
		include: {
			exercises: true
		}
	})

	if (!workout) {
		res.status(404)
		throw new Error('Workout nod found!')
	}

	const workoutLog = await prisma.workoutLog.create({
		data: {
			user: {
				connect: {
					id: req.user.id
				}
			},
			workout: {
				connect: {
					id: workoutId
				}
			},
			exerciseLogs: {
				create: workout.exercises.map(exercise => ({
					user: {
						connect: {
							id: req.user.id
						}
					},
					exercise: {
						connect: {
							id: exercise.id
						}
					},

					/*
					Далее заполняем дефолтными значениями. Аналогичный код: 
					снаружи относительно const workoutLog = ... : 
					let timesDefault = []
					for (let i = 0; i < exercise.times; i++) {
						timesDefault.push({
							weight: 0,
							repeat: 0
						})
					}
					а внутри exerciseLogs: {}
					...
					times: {
						createMany: {
							data: timesDefault
						}
					}
					...
					*/
					times: {
						create: Array.from({ length: exercise.times }, () => ({
							weight: 0,
							repeat: 0
						}))
					}
				}))
			}
		},
		include: {
			exerciseLogs: {
				include: {
					times: true
				}
			}
		}
	})
	res.json(workoutLog)
})
