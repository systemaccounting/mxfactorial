package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"testing"
)

const testDataPath string = "../../testdata/short.json"

const expected string = "./testdata/out"

func mockCompactFnError(*bytes.Buffer, []byte) error {
	return errors.New("test")
}

func TestRemoveWhiteSpace(t *testing.T) {
	g, err := ioutil.ReadFile(testDataPath)
	if err != nil {
		t.Fatal(err)
	}
	got, _ := RemoveWhiteSpace(g, json.Compact)
	w, err := ioutil.ReadFile(expected)
	if err != nil {
		t.Fatal(err)
	}
	want := string(w)
	if got != want {
		t.Fatalf("got %s, want %s", got, want)
	}
}

func TestRemoveWhiteSpaceError(t *testing.T) {
	g, err := ioutil.ReadFile(testDataPath)
	if err != nil {
		t.Fatal(err)
	}
	_, err = RemoveWhiteSpace(g, mockCompactFnError)
	got := err.Error()
	want := "test"
	if got != want {
		t.Fatalf("got %s, want %s", got, want)
	}
}
