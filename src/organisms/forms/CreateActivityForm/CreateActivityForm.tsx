import Button from "@atoms/Button";
import ErrorMessage from "@atoms/ErrorMessage";
import Form from "@atoms/Form";
import Input from "@atoms/Input";
import Label from "@atoms/Label";
import Select from "@atoms/Select";
import Subheading from "@atoms/Subheading";
import ButtonGroup from "@molecules/ButtonGroup";
import { RateType, SupportItem } from "@prisma/client";
import ActivityValidationSchema from "@schema/ActivityValidationSchema";
import { errorIn } from "@utils/helpers";
import axios from "axios";
import { FormikProps, getIn, withFormik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-toastify";
import * as Styles from "./styles";

const CreateActivityForm = () => {
	const router = useRouter();

	const BaseForm = (props: FormikProps<Partial<SupportItem>>) => {
		const { values, touched, errors, handleChange, handleBlur, handleSubmit } =
			props;

		return (
			<Styles.CreateActivityContainer>
				<Form onSubmit={handleSubmit} flexDirection="column">
					<Styles.InputGroup>
						<Styles.Heading>General</Styles.Heading>
						<Styles.InputRow>
							<Label htmlFor="description" required>
								<span>Description</span>
								<Subheading>
									The official description from the{" "}
									<a href="/price-guide-3-21.pdf">Price Guide</a>
								</Subheading>
								<Input
									type="text"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.description}
									name="description"
									id="description"
									error={errorIn(errors, touched, "description")}
								/>
							</Label>

							<Label htmlFor="rateType" required>
								<span>Rate Type</span>
								<Subheading>This will almost always be per hour</Subheading>
								<Select
									name="rateType"
									error={errorIn(errors, touched, "rateType")}
								>
									<option value="" disabled>
										Select...
									</option>
									<option value="HOUR">per hour</option>
									<option value="KM">per km</option>
								</Select>
							</Label>
						</Styles.InputRow>
					</Styles.InputGroup>

					<Styles.InputGroup>
						<Styles.Heading>Rates</Styles.Heading>
						<Subheading>
							Only the weekday information is required, and will be used in the
							event of another rate not being entered
						</Subheading>

						{["weekday", "weeknight", "saturday", "sunday"].map((day) => (
							<Styles.ActivityRow key={day}>
								<Label required={day === "weekday"}>
									<span>
										{day
											.split("_")
											.map(
												(word) => word.charAt(0).toUpperCase() + word.slice(1)
											)
											.join(" ")}
									</span>
								</Label>
								<Styles.InputContainer>
									<Input
										type="text"
										onChange={handleChange}
										onBlur={handleBlur}
										name={`${day}Code`}
										id={`${day}Code`}
										value={getIn(values, `${day}Code`)}
										placeholder="Code"
										error={errorIn(errors, touched, `${day}Code`)}
									/>
									<ErrorMessage
										error={getIn(errors, `${day}Code`)}
										touched={getIn(touched, `${day}Code`)}
									/>
								</Styles.InputContainer>

								<span style={{ marginRight: "-0.8rem" }}>$</span>
								<Styles.InputContainer>
									<Input
										type="text"
										onChange={handleChange}
										onBlur={handleBlur}
										name={`${day}Rate`}
										id={`${day}Rate`}
										value={getIn(values, `${day}Rate`)}
										placeholder="Rate"
										error={errorIn(errors, touched, `${day}Rate`)}
									/>
									<ErrorMessage
										error={getIn(errors, `${day}Rate`)}
										touched={getIn(touched, `${day}Rate`)}
									/>
								</Styles.InputContainer>
							</Styles.ActivityRow>
						))}
					</Styles.InputGroup>

					<ButtonGroup>
						<Button type="submit" primary>
							Create
						</Button>
						<Button type="button" onClick={() => router.push("/activities")}>
							Cancel
						</Button>
					</ButtonGroup>
				</Form>
			</Styles.CreateActivityContainer>
		);
	};

	const FormikForm = withFormik({
		mapPropsToValues: () =>
			({
				description: "" as string,
				rateType: RateType.HOUR,

				weekdayCode: "",
				weekdayRate: "",

				weeknightCode: "",
				weeknightRate: "",

				saturdayCode: "",
				saturdayRate: "",

				sundayCode: "",
				sundayRate: "",
			} as unknown as Partial<SupportItem>),
		handleSubmit: (values, { setSubmitting }) => {
			axios.post("/api/support-items", values).then(() => {
				toast.success("Support Item Created");
				router.push("/activities");
			});

			setSubmitting(false);
		},
		validationSchema: ActivityValidationSchema,
		validateOnChange: false,
		validateOnMount: false,
		validateOnBlur: true,
		displayName: "Activity Form",
	})(BaseForm);

	return <FormikForm />;
};

export default CreateActivityForm;
