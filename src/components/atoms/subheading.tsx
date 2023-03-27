import classNames from "classnames";

const Subheading = ({
	children,
	className,
	...rest
}: React.HTMLAttributes<HTMLParagraphElement>) => (
	<p className={classNames(["m-0 text-sm text-gray-700", className])} {...rest}>
		{children}
	</p>
);

export default Subheading;
