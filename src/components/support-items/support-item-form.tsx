import { Button } from "@/components/ui/button";
import Form from "@/components/ui/form-old";
import Heading from "@/components/ui/heading";
import Label from "@/components/ui/label-old";
import Subheading from "@/components/ui/subheading";
import Checkbox from "@/components/forms/checkbox";
import ErrorMessage from "@/components/forms/error-message";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select-old";
import { zodResolver } from "@hookform/resolvers/zod";
import { RateType } from "@prisma/client";
import type { SupportItemSchema } from "@/schema/support-item-schema";
import { supportItemSchema } from "@/schema/support-item-schema";
import { SupportItemByIdOutput } from "@/server/api/routers/support-item-router";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface Props {
	existingSupportItem?: SupportItemByIdOutput;
}

const SupportItemForm = ({ existingSupportItem }: Props) => {
	const formPurpose = existingSupportItem ? "update" : "create";

	const router = useRouter();

	const trpcUtils = trpc.useUtils();
	const createSupportItemMutation = trpc.supportItem.create.useMutation();
	const updateSupportItemMutation = trpc.supportItem.update.useMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isDirty, isValid },
		control,
	} = useForm<SupportItemSchema>({
		resolver: zodResolver(supportItemSchema),
		defaultValues: {
			description: existingSupportItem?.description ?? "",
			rateType: existingSupportItem?.rateType ?? RateType.HOUR,
			isGroup: existingSupportItem?.isGroup ?? false,
			weekdayCode: existingSupportItem?.weekdayCode ?? "",
			weekdayRate: Number(existingSupportItem?.weekdayRate) || undefined,
			weeknightCode: existingSupportItem?.weeknightCode ?? "",
			weeknightRate: Number(existingSupportItem?.weeknightRate) || undefined,
			saturdayCode: existingSupportItem?.saturdayCode ?? "",
			saturdayRate: Number(existingSupportItem?.saturdayRate) || undefined,
			sundayCode: existingSupportItem?.sundayCode ?? "",
			sundayRate: Number(existingSupportItem?.sundayRate) || undefined,
		},
		mode: "onBlur",
	});

	const onSubmit = (data: SupportItemSchema) => {
		if (existingSupportItem?.id) {
			updateSupportItemMutation
				.mutateAsync({ supportItem: { ...data, id: existingSupportItem.id } })
				.then(() => {
					toast.success("Support Item updated");

					trpcUtils.supportItem.list.invalidate();
					trpcUtils.supportItem.byId.invalidate({
						id: existingSupportItem.id,
					});
					router.push("/dashboard/support-items");
				});
		} else {
			createSupportItemMutation
				.mutateAsync({
					supportItem: data,
				})
				.then(() => {
					toast.success("Support Item created");

					trpcUtils.supportItem.list.invalidate();
					router.push("/dashboard/support-items");
				});
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-6">
			<Heading>
				{existingSupportItem
					? `Updating ${existingSupportItem.description}`
					: "Create New Support Item"}
			</Heading>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex shrink flex-col gap-4">
					<Heading size="small">General</Heading>
					<div className="flex gap-4">
						<Label htmlFor="description" required>
							<span>Description</span>
							<Subheading>
								The official description from the{" "}
								<a href="/price-guide-22-23.pdf">Price Guide</a>
							</Subheading>
							<Input
								name="description"
								register={register}
								type="text"
								placeholder="Description"
							/>
							<ErrorMessage error={errors.description?.message} />
						</Label>

						<Label required>
							<span>Rate Type</span>
							<Subheading>This will almost always be per hour</Subheading>
							<Select
								name="rateType"
								control={control}
								options={[
									{ label: "per hour", value: RateType.HOUR },
									{ label: "per km", value: RateType.KM },
								]}
							/>
							<ErrorMessage error={errors.rateType?.message} />
						</Label>
					</div>
					<Checkbox name="isGroup" register={register}>
						Is this a group activity?
					</Checkbox>
				</div>

				<div className="flex flex-col gap-4">
					<Heading size="small">Rates</Heading>
					<Subheading>
						Only the weekday information is required, and will be used in the
						event of another rate not being entered
					</Subheading>

					{(["weekday", "weeknight", "saturday", "sunday"] as const).map(
						(day) => (
							<div className="flex items-start gap-4" key={day}>
								<p className="mt-3 flex w-16 shrink-0 gap-1 text-sm font-semibold md:w-24 md:text-base">
									{day.charAt(0).toUpperCase() + day.slice(1)}{" "}
									<span className="text-red-500">
										{day === "weekday" && "*"}
									</span>
								</p>
								<div className="flex gap-2">
									<span className="flex flex-col">
										<Input
											name={`${day}Code`}
											register={register}
											type="text"
											placeholder="XX_XXX_XXXX_X_X"
										/>
										<ErrorMessage error={errors[`${day}Code`]?.message} />
									</span>
									<span className="flex flex-col">
										<Input
											name={`${day}Rate`}
											register={register}
											rules={{
												setValueAs: (v) => (v === "" ? "" : Number(v)),
											}}
											prefix="$"
										/>
										<ErrorMessage error={errors[`${day}Rate`]?.message} />
									</span>
								</div>
							</div>
						)
					)}
				</div>

				<div className="mt-4 flex justify-center gap-4">
					<Button type="submit" disabled={isSubmitting || !isDirty || !isValid}>
						{formPurpose.charAt(0).toUpperCase() + formPurpose.slice(1)}
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={() => router.back()}
					>
						Cancel
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default SupportItemForm;
