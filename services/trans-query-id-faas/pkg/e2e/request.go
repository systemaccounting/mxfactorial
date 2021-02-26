package e2e

import (
	"encoding/json"
	"fmt"
	"strconv"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	faas "github.com/systemaccounting/mxfactorial/services/trans-query-id-faas"
)

// Request ...
func Request(
	t *testing.T,
	e *faas.Event,
	awsRegion,
	lambdaFnName string) (faas.Transactions, error) {

	testeventJSON, err := json.Marshal(e)
	if err != nil {
		return nil, fmt.Errorf("marshal error: %v", err)
	}

	svc := lambda.New(session.New(&aws.Config{
		Region: aws.String(awsRegion),
	}))

	input := &lambda.InvokeInput{
		FunctionName: aws.String(lambdaFnName),
		Payload:      testeventJSON,
	}

	out, err := svc.Invoke(input)
	if err != nil {
		return nil, fmt.Errorf("invoke error: %v", err)
	}

	quoted := string(out.Payload)

	payload, err := strconv.Unquote(quoted)
	if err != nil {
		return nil, fmt.Errorf("unquote error: %v", err)
	}

	trans := make(faas.Transactions, 0)

	err = json.Unmarshal([]byte(payload), &trans)
	if err != nil {
		return nil, fmt.Errorf("unmarshal error: %v", err)
	}

	return trans, nil
}
