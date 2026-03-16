import type { Client } from '@urql/core';
import CREATE_REQUEST_MUTATION from '../graphql/mutation/createRequest';
import { emptyItem } from '../utils/transactions/requestCreate';

export function createRequestService(
	client: Client,
	account: string,
	setItems: (items: App.ITransactionItem[]) => void
) {
	async function submit(
		isCredit: boolean,
		sumValue: string,
		reqItems: App.ITransactionItem[],
		callbacks: { onStart: () => void; onEnd: () => void; onSuccess: () => void }
	) {
		callbacks.onStart();
		try {
			await client
				.mutation(CREATE_REQUEST_MUTATION, {
					auth_account: account,
					transaction: {
						author: account,
						author_role: isCredit ? 'creditor' : 'debitor',
						sum_value: sumValue,
						transaction_items: reqItems
					}
				})
				.toPromise();
			setItems([emptyItem()]);
			callbacks.onEnd();
			callbacks.onSuccess();
		} catch (err) {
			callbacks.onEnd();
			console.log((err as Error).message);
		}
	}

	return { submit };
}
