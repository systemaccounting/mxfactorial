package logger

import (
	"fmt"
	"path"
	"runtime"
	"time"
)

func Trace() string {
	pc := make([]uintptr, 15)
	n := runtime.Callers(2, pc)
	frames := runtime.CallersFrames(pc[:n])
	frame, _ := frames.Next()
	return fmt.Sprintf("TRACE: %s:%d:%s", path.Base(frame.File), frame.Line, path.Base(frame.Function))
}

func Err(trace string, err error) error {
	return fmt.Errorf("%v: %s: %v", Now(), trace, err)
}

func ErrFmt(err error) error {
	return fmt.Errorf("%s: ERROR: %v", Now(), err)
}

func Now() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
}

// logger.Log(logger.Trace(), err)
func Log(trace string, err error) {
	fmt.Println(Err(trace, err))
}
