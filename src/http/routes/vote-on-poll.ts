import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { voting } from "../../utils/voting-pub-sub";

export async function voteOnPoll(app: FastifyInstance) {
	app.post("/polls/:pollId/votes", async (request, reply) => {
		const voteOnPollBody = z.object({
			pollOptionId: z.string().uuid(),
		});

		const voteOnPollParams = z.object({
			pollId: z.string().uuid(),
		});

		const { pollId } = voteOnPollParams.parse(request.params);
		const { pollOptionId } = voteOnPollBody.parse(request.body);

		//Criar uma sessão para usuário fazer só um voto
		let sessionId = request.cookies.sessionId;

		if (sessionId) {
			const userPreviousVoteOnPoll = await prisma.vote.findUnique({
				where: {
					sessionId_pollId: {
						sessionId,
						pollId,
					},
				},
			});

			if (
				userPreviousVoteOnPoll &&
				userPreviousVoteOnPoll.pollOptionId !== pollOptionId
			) {
				// Apagar o voto anterior
				await prisma.vote.delete({
					where: {
						id: userPreviousVoteOnPoll.id,
					},
				});

				const votes = await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId);


			} else if (userPreviousVoteOnPoll) {
				return reply
					.status(400)
					.send({ message: "Você já votou nessa enquete" });
			}
		}

		if (!sessionId) {
			sessionId = randomUUID();

			reply.setCookie("sessionId", sessionId, {
				path: "/",
				maxAge: 60 * 60 * 24 * 30, //30 dias
				signed: true, // Garante que o back seja o criador
				httpOnly: true, // Somente o back vai ter acesso (front não tera acesso)
			});
		}

		await prisma.vote.create({
			data: {
				sessionId,
				pollId,
				pollOptionId,
			},
		});

		// incrimenta 1 a option pollOptionId no pollId
		const votes = await redis.zincrby(pollId, 1, pollOptionId);

		voting.publish(pollId, {
			pollOptionId,
			votes: Number(votes),
		})

		return reply.status(201).send();
	});
}
