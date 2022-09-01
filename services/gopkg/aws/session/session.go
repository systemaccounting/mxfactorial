package session

import "github.com/aws/aws-sdk-go/aws/session"

type AWSSession struct {
	*session.Session
}

func NewAWSSession() *AWSSession {
	s := session.Must(session.NewSession())
	return &AWSSession{Session: s}
}
