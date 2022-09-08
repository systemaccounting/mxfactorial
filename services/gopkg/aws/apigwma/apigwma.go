package apigwma

// api gateway management api used to send
// notifications to client websockets
// 1. https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html
// 2. https://docs.aws.amazon.com/sdk-for-go/api/service/apigatewaymanagementapi/

import (
	"encoding/json"
	"errors"

	"github.com/aws/aws-sdk-go/aws/awserr"
	apigw "github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/session"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
)

const ErrCodeGoneException = apigw.ErrCodeGoneException

type IAWSAPIGWMA interface {
	CreatePostToConnectionInput(*string, []byte) *apigw.PostToConnectionInput
	PostToConnection(*apigw.PostToConnectionInput) (*apigw.PostToConnectionOutput, error)
	Marshal(any) ([]byte, error)
}

type AWSAPIGWMA struct {
	MgmtAPI *apigw.ApiGatewayManagementApi
}

func (a AWSAPIGWMA) Marshal(v any) ([]byte, error) {
	return json.Marshal(v)
}

func (a AWSAPIGWMA) CreatePostToConnectionInput(connectionID *string, payload []byte) *apigw.PostToConnectionInput {
	return &apigw.PostToConnectionInput{
		ConnectionId: connectionID,
		Data:         payload,
	}
}

func (a AWSAPIGWMA) PostToConnection(input *apigw.PostToConnectionInput) (*apigw.PostToConnectionOutput, error) {
	return a.MgmtAPI.PostToConnection(input)
}

type ApiGatewayMgmtAPIService struct {
	IAWSAPIGWMA
}

func (a ApiGatewayMgmtAPIService) PostToConnection(connectionID *string, v any) error {

	payload, err := a.IAWSAPIGWMA.Marshal(v)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	input := a.IAWSAPIGWMA.CreatePostToConnectionInput(connectionID, payload)

	_, err = a.IAWSAPIGWMA.PostToConnection(input)
	if err != nil {

		// test for aws error
		// https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/handling-errors.html
		if aerr, ok := err.(awserr.Error); ok {

			// for isolation, return error code for
			// assertion on errors exported by this
			// package only, e.g. const ErrCodeGoneException
			return errors.New(aerr.Code())
		}

		// log and return other error
		logger.Log(logger.Trace(), err)
		return err
	}

	// message sent to websocket
	return nil
}

func NewApiGatewayMgmtAPIService(apiGWConnectionsURI, awsRegion *string) *ApiGatewayMgmtAPIService {
	// set region and endpoint in config
	c := session.NewAWSConfig(awsRegion).WithEndpoint(*apiGWConnectionsURI)
	// create session
	sess := session.NewAWSSession(c)
	// create api gateway management api service
	return &ApiGatewayMgmtAPIService{
		IAWSAPIGWMA: &AWSAPIGWMA{
			MgmtAPI: apigw.New(sess),
		},
	}
}
