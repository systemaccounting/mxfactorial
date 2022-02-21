package tools

import "time"

func GetLatestTime(t1, t2 *time.Time) time.Time {
	if t1.After(*t2) {
		return *t1
	}
	return *t2
}
