package request

import "testing"

var strPtrVar string = "test"
var boolPrtVar bool = true

func TestEmptyStringIfNilPtr(t *testing.T) {

	tests := []struct {
		input *string
		want  string
	}{
		{
			input: nil,
			want:  "",
		},
		{
			input: &strPtrVar,
			want:  "test",
		},
	}

	for _, v := range tests {
		got := EmptyStringIfNilPtr(v.input)
		want := v.want
		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}

func TestFalseIfNilPtr(t *testing.T) {

	tests := []struct {
		input *bool
		want  bool
	}{
		{
			input: nil,
			want:  false,
		},
		{
			input: &boolPrtVar,
			want:  true,
		},
	}

	for _, v := range tests {
		got := FalseIfNilPtr(v.input)
		want := v.want
		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}
