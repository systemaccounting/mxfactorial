package util

import "bytes"

// RemoveWhiteSpace ...
func RemoveWhiteSpace(
	b []byte,
	compactFn func(*bytes.Buffer, []byte) error,
) (string, error) {
	buf := new(bytes.Buffer)
	err := compactFn(buf, b)
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}
