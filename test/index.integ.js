"use strict"

const { getRules } = require("./queries/getRules.js")
const { createRequest } = require("./mutations/createRequest.js")
const { approveRequest } = require("./mutations/approveRequest.js")
const intRules = require("../services/gopkg/testdata/intRules.json")
const { GraphQLClient } = require("graphql-request")

const resource = "query"
const endpoint = process.env.GRAPHQL_URI + "/" + resource

const client = new GraphQLClient(endpoint)

describe("rules, request-create and request-approve services", () => {
    it("returns rules, creates a transaction request, and approves a transaction request to create a transaction", async () => {

        const rulesResp = await client.request(getRules, intRules)

        const createRequestVar = {
            auth_account: "GroceryCo",
            transaction_items: rulesResp.rules.transaction_items
        }

        const createRequestResp = await client.request(createRequest, createRequestVar)

        const approveRequestVar =  {
            transaction_id: createRequestResp.createRequest.id,
            account_name: "JacobWebb",
            account_role: "debitor",
            auth_account: "JacobWebb"
        }

        const approveRequestResp = await client.request(approveRequest, approveRequestVar)

        expect(approveRequestResp.approveRequest.equilibrium_time).toBeTruthy()
        expect(approveRequestResp.approveRequest.transaction_items).toHaveLength(6)
        for (const i of approveRequestResp.approveRequest.transaction_items) {
            expect(i.creditor_approval_time).toBeTruthy()
            expect(i.debitor_approval_time).toBeTruthy()
        }
    })
})