import axios, { AxiosResponse } from "axios"
import { SignatureV4 } from "@aws-sdk/signature-v4"
import { defaultProvider } from "@aws-sdk/credential-provider-node"
import { HttpRequest } from "@aws-sdk/protocol-http"
import { Sha256 } from "@aws-crypto/sha256-js"
import type {
	ITransaction,
	ITransactionItem,
	IApproval,
	IIntraTransaction,
	IRequestApprove,
	IQueryByAccount,
	IQueryByID,
} from "./index.d"

import nullFirstTrItemsNoAppr from "../pkg/testdata/nullFirstTrItemsNoAppr.json"
import transNoAppr from "../pkg/testdata/transNoAppr.json"

import { GraphQLClient } from "graphql-request"
import { getRules } from "./query/getRules"
import { getBalance } from "./query/getBalance"
import { getTransactionsByAccount } from "./query/getTransactionsByAccount"
import { createRequest } from "./mutation/createRequest"
import { approveRequest } from "./mutation/approveRequest"
import { getTransactionByID } from "./query/getTransactionByID"
import { getRequestsByAccount } from "./query/getRequestsByAccount"
import { getRequestByID } from "./query/getRequestByID"
import intRules from "../pkg/testdata/intRules.json"

// https://stackoverflow.com/a/3143231
export const DateRegexISO8601 = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/)


type Body = ITransactionItem[] | IIntraTransaction | IRequestApprove | IQueryByAccount | IQueryByID

async function post(url: string, body: Body): Promise<AxiosResponse> {

	// https://arpadt.com/articles/signing-requests-to-aws
	let apiUrl = new URL(url)

	let request = new HttpRequest({
		hostname: apiUrl.host,
		path: apiUrl.pathname,
		protocol: apiUrl.protocol,
		method: "POST",
		body: JSON.stringify(body),
		headers: {
			"Content-Type" : "application/json",
			host: apiUrl.hostname,
		},
	  })

	  if (process.env.AWS_LAMBDA_FUNCTION_NAME) { // mimic lambda environment

		let sigv4 = new SignatureV4({
			credentials: defaultProvider(),
			region: "us-east-1", // todo: assign from REGION env_var in project.yaml
			service: "lambda",
			sha256: Sha256,
		})

		let signed = await sigv4.sign(request)

		await process.nextTick(() => {}) // https://stackoverflow.com/a/70012434
		return axios({
			...signed,
			url,
			data: body,
		})
	}

	await process.nextTick(() => {})
	return axios({
		...request,
		url,
		data: body,
	})
}

async function createTransaction(): Promise<ITransaction> {
	let transactionRequest = await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)

	let debitApprover = transactionRequest.data.transaction.transaction_items[0].debitor
	let transactionId = transactionRequest.data.transaction.id

	let { data } = await post(process.env.REQUEST_APPROVE_URL as string, {
		auth_account: debitApprover,
		id: transactionId,
		account_name: debitApprover,
		account_role: "debitor",
	})

	return data.transaction
}


describe("rule", () => {

	it("adds 2 rule objects", async () => {

		let { data } = await post(process.env.RULE_URL as string, nullFirstTrItemsNoAppr)
		let ruleAdded: ITransactionItem[] = data.transaction.transaction_items.filter((x: ITransactionItem) => x.rule_instance_id)
		expect(ruleAdded).toHaveLength(2)
	})

	it("tax price sums to 1.620", async () => {
		let { data } = await post(process.env.RULE_URL as string, nullFirstTrItemsNoAppr)

		let trItems: ITransactionItem[] = data.transaction.transaction_items;
		const taxItems: ITransactionItem[] = trItems.filter(
			trItem => trItem.item_id === '9% state sales tax'
		)
		let tax: number = 0;
		for (let i = 0; i < taxItems.length; i++) {
			tax += parseFloat(taxItems[i].quantity) * parseFloat(taxItems[i].price)
		}
		expect(tax).toBe(1.62)
	})
})

describe("request-create", () => {
	it("adds approval timestamps to creditor approvals and transaction items", async () => {

		let { data } = await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)

		for (const trItem of data.transaction.transaction_items) {

			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)

			expect(trItem.debitor_approval_time).toBeFalsy()

			if (trItem.approvals != undefined) {
				for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == 'creditor')) {
					expect(approval.approval_time).toMatch(DateRegexISO8601)
				}

				for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == 'debitor')) {
					expect(approval.approval_time).toBeFalsy()
				}
			}
		}
	})
})

describe("request-approve", () => {
	it("adds approval timestamps to debitor approvals and transaction items", async () => {

		let accountRole = "debitor"

		let transactionRequest = await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)

		let debitApprover = transactionRequest.data.transaction.transaction_items[0].debitor
		let transactionId = transactionRequest.data.transaction.id

		let { data } = await post(process.env.REQUEST_APPROVE_URL as string, {
			auth_account: debitApprover,
			id: transactionId,
			account_name: debitApprover,
			account_role: accountRole,
		})

		for (const trItem of data.transaction.transaction_items) {
			expect(trItem.debitor_approval_time).toMatch(DateRegexISO8601)
			for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == accountRole)) {
				expect(approval.approval_time).toMatch(DateRegexISO8601)
			}
		}
	})
})

describe("balance-by-account", () => {

	it("returns 1020 GroceryStore account balance", async () => {

		await createTransaction()

		let accountName = "GroceryStore"

		let { data } = await post(process.env.BALANCE_BY_ACCOUNT_URL as string, {
			auth_account: accountName,
			account_name: accountName,
		})

		expect(data).toBe(1020)
	})

	it("returns 1001.8 StateOfCalifornia account balance", async () => {

		await createTransaction()

		let accountName = "StateOfCalifornia"

		let { data } = await post(process.env.BALANCE_BY_ACCOUNT_URL as string, {
			auth_account: accountName,
			account_name: accountName,
		})

		expect(data).toBe(1001.8)
	})

	it("returns 978.2 JacobWebb account balance", async () => {

		await createTransaction()

		let accountName = "JacobWebb"

		let { data } = await post(process.env.BALANCE_BY_ACCOUNT_URL as string, {
			auth_account: accountName,
			account_name: accountName,
		})

		expect(data).toBe(978.2)
	})
})

describe("transaction-by-id", () => {
	it("returns transaction by id", async () => {

		let transaction = await createTransaction()

		await process.nextTick(() => {})

		const accountName = transaction.transaction_items[0].debitor
		let { data } = await post(process.env.TRANSACTION_BY_ID_URL as string, {
			auth_account: accountName,
			account_name: accountName,
			id: transaction.id,
		})

		for (const trItem of data.transaction.transaction_items) {
			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
			for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "creditor")) {
				expect(approval.approval_time).toMatch(DateRegexISO8601)
			}
		}

		for (const trItem of data.transaction.transaction_items) {
			expect(trItem.debitor_approval_time).toMatch(DateRegexISO8601)
			for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "debitor")) {
				expect(approval.approval_time).toMatch(DateRegexISO8601)
			}
		}
	})
})

describe("transactions-by-account", () => {
	it("returns 2 transactions by account", async () => {

		await createTransaction() // first transaction
		let secondTransaction = await createTransaction()

		let debitApprover = secondTransaction.transaction_items[0].debitor

		let { data } = await post(process.env.TRANSACTIONS_BY_ACCOUNT_URL as string, {
			auth_account: debitApprover,
			account_name: debitApprover,
		})

		expect(data.transactions).toHaveLength(2)

		for (const transaction of data.transactions) {
			for (const trItem of transaction.transaction_items) {
				expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
				for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "creditor")) {
					expect(approval.approval_time).toMatch(DateRegexISO8601)
				}
			}

			for (const trItem of transaction.transaction_items) {
				expect(trItem.debitor_approval_time).toMatch(DateRegexISO8601)
				for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "debitor")) {
					expect(approval.approval_time).toMatch(DateRegexISO8601)
				}
			}
		}
	})
})

describe("request-by-id", () => {
	it("returns a transaction request by id", async () => {

		let createRequest = await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)

		const accountName = createRequest.data.transaction.transaction_items[0].debitor

		let { data } = await post(process.env.REQUEST_BY_ID_URL as string, {
			auth_account: accountName,
			account_name: accountName,
			id: createRequest.data.transaction.id,
		})

		for (const trItem of data.transaction.transaction_items) {
			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
			for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "creditor")) {
				expect(approval.approval_time).toMatch(DateRegexISO8601)
			}
		}

		for (const trItem of data.transaction.transaction_items) {
			expect(trItem.debitor_approval_time).toBeNull()
			for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "debitor")) {
				expect(approval.approval_time).toBeNull()
			}
		}
	})
})

describe("requests-by-account", () => {
	it("returns 2 transaction requests by account", async () => {

		// create requests with unused account
		const debitApprover = "AaronHill"
		let request = transNoAppr.transaction
		for (let i = 0; i < request.transaction_items.length; i++) {
			request.transaction_items[i].debitor = debitApprover
		}

		// create request 1
		await post(process.env.REQUEST_CREATE_URL as string, {
			auth_account: request.author,
			transaction: request,
		})

		// create request 2
		await post(process.env.REQUEST_CREATE_URL as string, {
			auth_account: request.author,
			transaction: request,
		})

		let { data } = await post(process.env.REQUESTS_BY_ACCOUNT_URL as string, {
			auth_account: debitApprover,
			account_name: debitApprover,
		})

		expect(data.transactions).toHaveLength(2)

		for (const transaction of data.transactions) {
			for (const trItem of transaction.transaction_items) {
				expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
				for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "creditor")) {
					expect(approval.approval_time).toMatch(DateRegexISO8601)
				}
			}

			for (const trItem of transaction.transaction_items) {
				expect(trItem.debitor_approval_time).toBeNull()
				for (const approval of trItem.approvals.filter((x: IApproval) => x.account_role == "debitor")) {
					expect(approval.approval_time).toBeNull()
				}
			}
		}
	})
})

describe("graphql", () => {

	it("returns 3 rule added transaction items", async () => {
		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")
		const res = await client.request(getRules, intRules)
		const ruleAdded: ITransactionItem[] = res.rules.transaction_items.filter((x: ITransactionItem) => x.rule_instance_id)
		expect(ruleAdded).toHaveLength(3)
	})

	it("creates a request", async () => {
		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const rulesRes = await client.request(getRules, intRules)

		const res = await client.request(createRequest, {
            auth_account: "GroceryCo",
            transaction_items: rulesRes.rules.transaction_items
        })

		expect(res.createRequest.equilibrium_time).toBeFalsy()
		expect(res.createRequest.transaction_items).toHaveLength(6)

		for (const trItem of res.createRequest.transaction_items) {
			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
		}
	})

	it("creates a transaction", async () => {
		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const { rules } = await client.request(getRules, intRules)

		const create = await client.request(createRequest, {
            auth_account: "GroceryCo",
            transaction_items: rules.transaction_items
        })

		const approve = await client.request(approveRequest, {
            id: create.createRequest.id,
            account_name: "JacobWebb",
            account_role: "debitor",
            auth_account: "JacobWebb"
        })

		expect(approve.approveRequest.equilibrium_time).toMatch(DateRegexISO8601)
		expect(approve.approveRequest.transaction_items).toHaveLength(6)

		for (const trItem of approve.approveRequest.transaction_items) {
			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
		}

		for (const trItem of approve.approveRequest.transaction_items) {
			expect(trItem.debitor_approval_time).toMatch(DateRegexISO8601)
		}
	})

	it("returns an account balance", async () => {
		const transaction = await createTransaction()

		const accountName = transaction.transaction_items[0].debitor

		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const { balance } = await client.request(getBalance, {
            auth_account: accountName,
            account_name: accountName,
        })

		expect(balance).toBe("978.200")
	})

	it("returns transactions by account", async () => {

		await createTransaction() // first transaction
		let secondTransaction = await createTransaction()

		const accountName = secondTransaction.transaction_items[0].debitor

		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const { transactionsByAccount } = await client.request(getTransactionsByAccount, {
            auth_account: accountName,
            account_name: accountName,
        })

		expect(transactionsByAccount).toHaveLength(2)

		for (const transaction of transactionsByAccount) {

			expect(transaction.equilibrium_time).toMatch(DateRegexISO8601)
			expect(transaction.transaction_items).toHaveLength(6)

			for (const trItem of transaction.transaction_items) {
				expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
			}

			for (const trItem of transaction.transaction_items) {
				expect(trItem.debitor_approval_time).toMatch(DateRegexISO8601)
			}
		}
	})

	it("returns a transaction by id", async () => {

		let transaction = await createTransaction()

		const accountName = transaction.transaction_items[0].debitor

		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const { transactionByID } = await client.request(getTransactionByID, {
            auth_account: accountName,
			account_name: accountName,
            id: transaction.id,
        })

		expect(transactionByID.id).toBe("3")
		expect(transactionByID.equilibrium_time).toMatch(DateRegexISO8601)
		expect(transactionByID.transaction_items).toHaveLength(6)

		for (const trItem of transactionByID.transaction_items) {
			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
		}

		for (const trItem of transactionByID.transaction_items) {
			expect(trItem.debitor_approval_time).toMatch(DateRegexISO8601)
		}
	})

	it("returns 2 requests by account", async () => {

		// create requests with unused account
		const debitApprover = "AaronHill"
		let request = transNoAppr.transaction
		for (let i = 0; i < request.transaction_items.length; i++) {
			request.transaction_items[i].debitor = debitApprover
		}

		await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)
		let { data } = await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)

		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const { requestsByAccount } = await client.request(getRequestsByAccount, {
            auth_account: debitApprover,
            account_name: debitApprover,
        })

		expect(requestsByAccount).toHaveLength(2)

		for (const request of requestsByAccount) {

			expect(request.equilibrium_time).toBeFalsy()
			expect(request.transaction_items).toHaveLength(6)

			for (const trItem of request.transaction_items) {
				expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
			}

			for (const trItem of request.transaction_items) {
				expect(trItem.debitor_approval_time).toBeFalsy()
			}
		}
	})

		it("returns a request by id", async () => {

		const { data } = await post(process.env.REQUEST_CREATE_URL as string, transNoAppr)

		const accountName = data.transaction.transaction_items[0].debitor

		const client = new GraphQLClient(process.env.GRAPHQL_URI as string + "/query")

		const { requestByID } = await client.request(getRequestByID, {
            auth_account: accountName,
			account_name: accountName,
            id: data.transaction.id,
        })

		expect(requestByID.id).toBe("3")
		expect(requestByID.equilibrium_time).toBeFalsy()
		expect(requestByID.transaction_items).toHaveLength(6)

		for (const trItem of requestByID.transaction_items) {
			expect(trItem.creditor_approval_time).toMatch(DateRegexISO8601)
		}

		for (const trItem of requestByID.transaction_items) {
			expect(trItem.debitor_approval_time).toBeFalsy()
		}
	})
})