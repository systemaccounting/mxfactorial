package types

import "testing"

var isStringUniqueTests = []struct {
	inputval  string
	inputlist []string
	want      bool
}{
	{
		inputval: "1",
		inputlist: []string{
			"2",
			"3",
		},
		want: true,
	},
	{
		inputval: "1",
		inputlist: []string{
			"1",
			"3",
		},
		want: false,
	},
}

func TestIsStringUnique(t *testing.T) {
	for _, tc := range isStringUniqueTests {
		got := isStringUnique(tc.inputval, tc.inputlist)
		if got != tc.want {
			t.Errorf("got %v, want %v", got, tc.want)
		}
	}
}

var isIfaceStringUniqueTests = []struct {
	inputval  string
	inputlist []interface{}
	want      bool
}{
	{
		inputval: "1",
		inputlist: []interface{}{
			"2",
			"3",
		},
		want: true,
	},
	{
		inputval: "1",
		inputlist: []interface{}{
			"1",
			"3",
		},
		want: false,
	},
}

func TestIsIfaceStringUnique(t *testing.T) {
	for _, tc := range isIfaceStringUniqueTests {
		got := isIfaceStringUnique(tc.inputval, tc.inputlist)
		if got != tc.want {
			t.Errorf("got %v, want %v", got, tc.want)
		}
	}
}
