package lambda

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/systemaccounting/mxfactorial/pkg/aws/session"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
)

type IAWSLambda interface {
	CreateInvokeInput([]byte) *lambda.InvokeInput
	Invoke(*lambda.InvokeInput) (*lambda.InvokeOutput, error)
	Marshal(any) ([]byte, error)
}

type AWSLambda struct {
	*lambda.Lambda
	FunctionName *string
}

func (a AWSLambda) CreateInvokeInput(body []byte) *lambda.InvokeInput {
	return &lambda.InvokeInput{
		FunctionName: a.FunctionName,
		Payload:      body,
	}
}

func (a AWSLambda) Invoke(input *lambda.InvokeInput) (*lambda.InvokeOutput, error) {
	return a.Lambda.Invoke(input)
}

func (a AWSLambda) Marshal(v any) ([]byte, error) {
	return json.Marshal(v)
}

type ILambdaService interface {
	Invoke(any) ([]byte, error)
}

type LambdaService struct {
	IAWSLambda
}

func (l LambdaService) Invoke(v any) ([]byte, error) {

	body, err := l.IAWSLambda.Marshal(v)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	input := l.CreateInvokeInput(body)

	out, err := l.IAWSLambda.Invoke(input)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return out.Payload, nil
}

func NewLambdaService(lambdaFnName, awsRegion *string) *LambdaService {
	c := session.NewAWSConfig(awsRegion)
	sess := session.NewAWSSession(c)
	return &LambdaService{
		IAWSLambda: AWSLambda{
			Lambda:       lambda.New(sess),
			FunctionName: lambdaFnName,
		},
	}
}
