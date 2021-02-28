package faas

import (
	"fmt"
	"os"
	"strconv"
)

// EnvVars ...
type EnvVars map[string]int

// Assign ...
func (e EnvVars) Assign() error {
	for k := range e {
		var err error
		e[k], err = EnvVarToInt(k)
		if err != nil {
			return err
		}
	}
	return nil
}

// EnvVarToInt ...
func EnvVarToInt(envVar string) (int, error) {
	val := os.Getenv(envVar)
	if val == "" {
		return 0, fmt.Errorf("%s variable NOT set", envVar)
	}
	i, err := strconv.Atoi(val)
	if err != nil {
		return 0, err
	}
	return i, nil
}
