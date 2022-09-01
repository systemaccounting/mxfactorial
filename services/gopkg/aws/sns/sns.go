package sns

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/service/sns"
	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/session"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ISNS interface {
	Publish(types.IDs, *string, *string) error
}

type SNS struct {
	*sns.SNS
}

var (
	snsMsgAttributeName          = "SERVICE"
	snsMsgAttributeValueDataType = "String"
	TRANSACT_SERVICE_NAME        = "TRANSACT"
)

func (s *SNS) Publish(notifIDs types.IDs, serviceName *string, topicArn *string) error {

	input, err := CreateSNSInput(notifIDs, serviceName, topicArn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	_, err = s.SNS.Publish(input)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewSNS() *SNS {
	sess := session.NewAWSSession()
	return &SNS{
		SNS: sns.New(sess.Session),
	}
}

func CreateSNSInput(
	notifIDs types.IDs,
	serviceName *string,
	topicArn *string,
) (*sns.PublishInput, error) {

	snsMsgBytes, err := json.Marshal(notifIDs)
	if err != nil {
		return nil, fmt.Errorf("CreateSNSInput json marshal: %v", err)
	}

	snsMsg := string(snsMsgBytes)

	snsMsgAttributes := make(map[string]*sns.MessageAttributeValue)

	snsMsgAttributes[snsMsgAttributeName] = &sns.MessageAttributeValue{
		DataType:    &snsMsgAttributeValueDataType,
		StringValue: serviceName,
	}

	return &sns.PublishInput{
		Message:           &snsMsg,
		TopicArn:          topicArn,
		MessageAttributes: snsMsgAttributes,
	}, nil
}
