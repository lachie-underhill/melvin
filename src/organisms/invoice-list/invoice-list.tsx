import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useState } from "react";
import * as Styles from "./styles";
import PdfDocument from "@molecules/pdf-document";
import { toast } from "react-toastify";
import Button from "@atoms/button";
import axios from "axios";
import { saveAs } from "file-saver";
import useSWR, { useSWRConfig } from "swr";
import { getTotalCost } from "@utils/helpers";
import { Invoice } from "types/invoice";
import Display from "@atoms/display";

const getInvoices = async () => {
	const response = await fetch("/api/invoices");
	return (await response.json()) as Invoice[];
};

const savePdf = (invoiceId: string) => {
	axios
		.get(`/api/invoices/generate-pdf?invoiceId=${invoiceId}`)
		.then((response) => {
			const pdf = Buffer.from(response.data, "base64");
			const blob = new Blob([pdf], { type: "application/pdf" });

			const matches = response.headers["content-disposition"].match(/"(.*?)"/);
			const fileName = matches ? matches[0] : "generated.pdf";

			saveAs(blob, fileName);
		})
		.catch((error) => {
			console.error(error);
			toast.error("An unknown error occured");
		});
};

export default function InvoiceList() {
	const { mutate } = useSWRConfig();
	const { data: invoices, error } = useSWR("/api/invoices", getInvoices);

	const [expandedInvoice, expandInvoice] = useState<number | undefined>();

	if (error) {
		console.error(error);
		return <div>Error loading</div>;
	}
	if (!invoices) return <div>loading...</div>;

	return (
		<Styles.Container>
			<Styles.Header>
				<Display className="small">Invoices</Display>
				<Link href="/invoices/create" passHref>
					<Button primary>+ Add New</Button>
				</Link>
			</Styles.Header>
			{invoices.map((invoice, index) => (
				<Styles.InvoiceContainer
					className={expandedInvoice === index ? "expanded" : ""}
					key={invoice.id}
				>
					<Styles.Invoice>
						<div
							onClick={() =>
								expandInvoice(expandedInvoice === index ? undefined : index)
							}
						>
							<Styles.Expander>
								<FontAwesomeIcon icon={["fas", "chevron-right"]} size="2x" />
							</Styles.Expander>
							<Styles.Column>
								<h2>{invoice.invoiceNo}</h2>
								<span>{dayjs(invoice.date).format("DD/MM/YYYY")}</span>
							</Styles.Column>

							<Styles.Column>
								<span>
									<b>{invoice.client?.name}</b>
								</span>
								<span>${getTotalCost(invoice.activities)}</span>
							</Styles.Column>
						</div>

						<Styles.Actions>
							<a onClick={() => savePdf(invoice.id)}>
								<FontAwesomeIcon icon={["fas", "download"]} size="lg" />
							</a>
							<Styles.OptionsMenu tabIndex={0}>
								<FontAwesomeIcon icon={["fas", "ellipsis-v"]} size="lg" />
								<div className="dropdown">
									<Link href={`/invoices/${invoice.id}?edit=true`}>Edit</Link>
									<Link href={`/invoices/create?copyFrom=${invoice.id}`}>
										Copy
									</Link>
									<a
										onClick={() => {
											// TODO: Custom confirm component
											if (
												confirm(
													`Are you sure you want to delete ${invoice.invoiceNo}?`
												)
											) {
												axios
													.delete(`/api/invoices/${invoice.id}`)
													.then((response) => {
														mutate("/api/invoices");
														toast.success(response);
													})
													.catch((error_) => toast.error(error_));
											}
										}}
									>
										Delete
									</a>
								</div>
							</Styles.OptionsMenu>
						</Styles.Actions>
					</Styles.Invoice>
					<Styles.PdfPreview>
						{expandedInvoice === index && (
							<PdfDocument invoiceNo={invoice.id} />
						)}
					</Styles.PdfPreview>
				</Styles.InvoiceContainer>
			))}
		</Styles.Container>
	);
}
