package sns

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/service/sns"
	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/session"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ISNS interface {
	PublishMessage(*sns.PublishInput) (*sns.PublishOutput, error)
}

type AWSSNS struct {
	*sns.SNS
}

type snsMsgAttributes map[string]*sns.MessageAttributeValue

func (s *AWSSNS) PublishMessage(i *sns.PublishInput) (*sns.PublishOutput, error) {
	return s.SNS.Publish(i)
}

type SNS struct {
	ISNS
}

var (
	snsMsgAttributeName          = "SERVICE"
	snsMsgAttributeValueDataType = "String"
	TRANSACT_SERVICE_NAME        = "TRANSACT"
)

func (s *SNS) Publish(notifIDs types.IDs, serviceName *string, topicArn *string) error {

	input, err := createPublishInput(notifIDs, serviceName, topicArn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	_, err = s.PublishMessage(input)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func createSNSAttributes(serviceName *string) snsMsgAttributes {
	return snsMsgAttributes{
		snsMsgAttributeName: &sns.MessageAttributeValue{
			DataType:    &snsMsgAttributeValueDataType,
			StringValue: serviceName,
		},
	}
}

func createPublishInput(
	notifIDs types.IDs,
	serviceName *string,
	topicArn *string,
) (*sns.PublishInput, error) {

	snsMsgBytes, err := json.Marshal(&notifIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	snsMsg := string(snsMsgBytes)

	msgAttr := createSNSAttributes(serviceName)

	return &sns.PublishInput{
		Message:           &snsMsg,
		TopicArn:          topicArn,
		MessageAttributes: msgAttr,
	}, nil
}

func NewSNS() *SNS {

	sess := session.NewAWSSession(nil)
	awssns := new(AWSSNS)
	awssns.SNS = sns.New(sess.Session)

	snsService := new(SNS)
	snsService.ISNS = awssns

	return snsService
}
