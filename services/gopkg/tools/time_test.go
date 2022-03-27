package tools

import (
	"testing"
	"time"
)

func TestGetLatestTime(t *testing.T) {
	t1 := time.Now()
	t2 := time.Now().Add(time.Hour * 24)
	got := GetLatestTime(&t1, &t2)
	want := t2
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
