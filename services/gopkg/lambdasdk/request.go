package lambdasdk

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// Invoke ...
func Invoke(
	t []*types.TransactionItem,
	awsRegion,
	lambdaFnName string) (
	*types.IntraTransaction, error) {

	body, err := json.Marshal(t)
	if err != nil {
		return nil, err
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(awsRegion),
	})
	if err != nil {
		return nil, err
	}

	svc := lambda.New(sess)

	input := lambda.InvokeInput{
		FunctionName: aws.String(lambdaFnName),
		Payload:      body,
	}

	out, err := svc.Invoke(&input)
	if err != nil {
		return nil, err
	}

	var intraTransaction types.IntraTransaction

	err = json.Unmarshal(out.Payload, &intraTransaction)
	if err != nil {
		return nil, err
	}

	return &intraTransaction, nil
}
