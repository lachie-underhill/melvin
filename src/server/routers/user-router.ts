import { userSchema } from "@schema/user-schema";
import { authedProcedure, router } from "@server/trpc";
import { inferRouterOutputs, TRPCError } from "@trpc/server";
import { z } from "zod";

const defaultUserSelect = {
	id: true,
	name: true,
	email: true,
	abn: true,
	bankName: true,
	bankNumber: true,
	bsb: true,
};

export const userRouter = router({
	fetch: authedProcedure.query(async ({ ctx }) => {
		const user = await ctx.prisma.user.findFirst({
			select: { ...defaultUserSelect },
			where: {
				id: ctx.session.user.id,
			},
		});

		if (user) return user;
		else throw new TRPCError({ code: "NOT_FOUND" });
	}),
	update: authedProcedure
		.input(
			z.object({
				user: userSchema,
			})
		)
		.mutation(async ({ input, ctx }) => {
			const user = await ctx.prisma.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: { ...input.user },
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
				});
			}

			return { user: user };
		}),
});

export type UserFetchOutput = inferRouterOutputs<typeof userRouter>["fetch"];
