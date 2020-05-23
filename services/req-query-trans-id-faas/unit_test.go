package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
)

var t1 transaction = transaction{}
var t2 transaction = transaction{}
var evt1 event = event{TransactionID: "test_tx1"}
var evt2 event = event{TransactionID: "test_tx23"}

func Test_GetRequestByID_Found(t *testing.T) {
	db := setupTest()
	
	expected1, _ := json.Marshal([]transaction{t1, t2})
	res1, _ := evt1.getRequestsByID(db, q)

	assert.Equal(t, string(expected1), res1)
}

func Test_GetRequestByID_EmptyResult(t *testing.T) {
	db := setupTest()

	expected2, _ := json.Marshal([]transaction{})
	res2, _ := evt2.getRequestsByID(db, q)

	assert.Equal(t, string(expected2), res2)
}

func setEnvironment() {
	// required for go-sqlite3
	os.Setenv("CGOENABLED", "1")
	os.Create("test.db")
}

func setData() {
	var txId NullString
	txId.String = "test_tx1"
	txId.Valid = true

	var creditor NullString
	creditor.String = "creditor"
	creditor.Valid = true
	var debitor NullString
	debitor.String = "debitor"
	debitor.Valid = true
	var author NullString
	author.String = "author"
	author.Valid = true

	createdAt := time.Now().Format(time.RFC3339)

	t1.TableID = "1"
	t1.Name = "bread"
	t1.Quantity = "3"
	t1.Price = "0.90"
	t1.TransactionID = txId
	t1.Author = author
	t1.Debitor = debitor
	t1.Creditor = creditor
	t1.CreatedAt = createdAt

	t2.TableID = "2"
	t2.Name = "butter"
	t2.Quantity = "1"
	t2.Price = "1.25"
	t2.TransactionID = txId
	t2.Author = author
	t2.Debitor = debitor
	t2.Creditor = creditor
	t2.CreatedAt = createdAt
}

func setupDb(db *sql.DB) {
	createTableQ := "CREATE TABLE IF NOT EXISTS transactions " +
		"(id INTEGER PRIMARY KEY, " +
		"name TEXT, price TEXT, quantity TEXT, " +
		"unit_of_measurement TEXT, units_measured TEXT, " +
		"rule_instance_id TEXT, transaction_id TEXT, " +
		"author TEXT, expiration_time TEXT, debitor TEXT, " +
		"creditor TEXT, debitor_profile_latlng TEXT, " +
		"creditor_profile_latlng TEXT, debitor_transaction_latlng TEXT, " +
		"creditor_transaction_latlng TEXT, debitor_approval_time TEXT, " +
		"creditor_approval_time TEXT, debitor_device TEXT, " +
		"creditor_device TEXT, debit_approver TEXT, " +
		"credit_approver TEXT, creditor_rejection_time TEXT, " +
		"debitor_rejection_time TEXT, createdAt TIMESTAMP)"

	insertQ := "INSERT INTO transactions (" +
		"id, name, price, quantity, transaction_id, " +
		"author, debitor, creditor, createdAt) " +
		"VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"

	_, err := db.Exec(createTableQ)
	if err != nil {
		log.Println("Create:", err)
	}
	_, err = db.Exec(insertQ, t1.TableID, t1.Name, t1.Price, t1.Quantity,
		t1.TransactionID, t1.Author, t1.Debitor, t1.Creditor, t1.CreatedAt)
	if err != nil {
		log.Println("Insert:", err)
	}
	db.Exec(insertQ, t2.TableID, t2.Name, t2.Price, t2.Quantity,
		t2.TransactionID, t2.Author, t2.Debitor, t2.Creditor, t2.CreatedAt)
}

func setupTest() *sql.DB {
	setEnvironment()
	setData()
	db, err := sql.Open("sqlite3", "./test.db")
	if err != nil {
		log.Println("Open:", err)
	}
	setupDb(db)

	return db
}
