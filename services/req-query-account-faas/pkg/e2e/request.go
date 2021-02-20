package e2e

import (
	"encoding/json"
	"strconv"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	faas "github.com/systemaccouting/mxfactorial/services/req-query-account-faas"
)

// Request ...
func Request(
	t *testing.T,
	e *faas.Event,
	awsRegion,
	lambdaFnName string) (faas.Transactions, error) {

	testeventJSON, err := json.Marshal(e)
	if err != nil {
		t.Error(err)
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
		t.Error(err)
	}

	quoted := string(out.Payload)

	payload, err := strconv.Unquote(quoted)
	if err != nil {
		return nil, err
	}

	trans := make(faas.Transactions, 0)

	err = json.Unmarshal([]byte(payload), &trans)
	if err != nil {
		t.Error(err)
	}

	return trans, nil
}
