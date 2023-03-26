import ConfirmDialog from "@atoms/confirm-dialog";
import Heading from "@atoms/heading";
import Loading from "@atoms/loading";
import InvoiceList from "@components/invoices/invoice-list";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

const ClientPage = () => {
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const trpcContext = trpc.useContext();
	const { data: client, error } = trpc.clients.byId.useQuery({
		id: String(router.query.id),
	});
	const deleteClientMutation = trpc.clients.delete.useMutation();

	const deleteClient = () => {
		deleteClientMutation
			.mutateAsync({ id: String(router.query.id) })
			.then(() => {
				trpcContext.clients.list.invalidate();
				toast.success("Client deleted");
				router.push("/clients");
			})
			.catch(() => {
				toast.error("An error occured. Please refresh and try again.");
			});
	};

	if (error) {
		console.error(error);
		return <div>Error</div>;
	}
	if (!client) return <Loading />;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-center p-4">
			<ConfirmDialog
				title="Are you sure you want to delete this client?"
				description="This cannot be undone."
				isOpen={isDeleteDialogOpen}
				setIsOpen={setIsDeleteDialogOpen}
				confirmText="Delete"
				cancelText="Cancel"
				confirmAction={deleteClient}
			/>

			<div className="my-2 flex w-full flex-col gap-2 px-4 sm:my-8">
				<div className="mb-2 flex items-center justify-between">
					<Heading className="medium text-lg sm:text-2xl">
						{client.name}
					</Heading>
					<Menu as="div" className="relative inline-block">
						<Menu.Button className="py-2 px-4 text-xl hover:bg-neutral-100">
							<FontAwesomeIcon icon={faEllipsisV} />
						</Menu.Button>
						<Menu.Items className="absolute right-0 flex w-40 origin-top-right flex-col bg-slate-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<Menu.Item>
								<Link
									href={`/clients/${client.id}/edit`}
									className="px-3 py-4 text-neutral-900 hover:bg-neutral-100 sm:py-2"
								>
									Edit
								</Link>
							</Menu.Item>
							<Menu.Item>
								<button
									type="button"
									className="px-3 py-4 text-left text-neutral-900 hover:bg-neutral-100 sm:py-2"
									onClick={() => setIsDeleteDialogOpen(true)}
								>
									Delete
								</button>
							</Menu.Item>
						</Menu.Items>
					</Menu>
				</div>

				<div className="flex flex-col">
					<h3 className="font-semibold">Client Number</h3>
					<p>{client.number}</p>
				</div>

				<div className="flex flex-col">
					<h3 className="font-semibold">Bill To</h3>
					<p>{client.billTo ?? "Not Set"}</p>
				</div>

				<div className="flex flex-col">
					<h3 className="font-semibold">Invoice Prefix</h3>
					<p>
						{client.invoiceNumberPrefix}
						<span className="text-gray-500">##</span>
					</p>
				</div>
			</div>

			<InvoiceList clientId={client.id} groupByAssignedStatus={false} />
		</div>
	);
};

export default ClientPage;