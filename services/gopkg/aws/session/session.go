package session

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
)

type AWSSession struct {
	*session.Session
}

func NewAWSConfig(awsRegion *string) *aws.Config {
	return &aws.Config{
		Region: awsRegion,
	}
}

func NewAWSSession(config *aws.Config) *AWSSession {
	s := session.Must(session.NewSession(config))
	return &AWSSession{Session: s}
}
