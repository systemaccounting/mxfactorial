package apigwma

import (
	"errors"
	"strconv"
	"testing"

	"github.com/aws/aws-sdk-go/aws/awserr"
	apigw "github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/golang/mock/gomock"
	"github.com/google/go-cmp/cmp"
	mapigwma "github.com/systemaccounting/mxfactorial/pkg/aws/apigwma/mock_apigwma"
)

func TestMarshal(t *testing.T) {
	testpayload := "testpayload"
	testservice := AWSAPIGWMA{}
	want := []byte(strconv.Quote(testpayload))
	got, err := testservice.Marshal(testpayload)
	if err != nil {
		t.Errorf("Marshal err: %v", err)
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestCreatePostToConnectionInput(t *testing.T) {
	testpayload := []byte(strconv.Quote("testpayload"))
	testconnectionid := "123"
	testservice := AWSAPIGWMA{}
	want := &apigw.PostToConnectionInput{
		ConnectionId: &testconnectionid,
		Data:         testpayload,
	}
	got := testservice.CreatePostToConnectionInput(&testconnectionid, testpayload)
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestPostToConnection(t *testing.T) {
	testpayloadtext := "testpayload"
	testpayload := []byte(strconv.Quote(testpayloadtext))
	testconnectionid := "123"
	testinput := &apigw.PostToConnectionInput{
		ConnectionId: &testconnectionid,
		Data:         testpayload,
	}

	ctrl := gomock.NewController(t)
	m := mapigwma.NewMockIAWSAPIGWMA(ctrl)

	testservice := ApiGatewayMgmtAPIService{m}

	m.
		EXPECT().
		Marshal(testpayloadtext).
		Times(1).
		Return(testpayload, nil)

	m.
		EXPECT().
		CreatePostToConnectionInput(&testconnectionid, testpayload).
		Times(1).
		Return(testinput)

	m.
		EXPECT().
		PostToConnection(testinput).
		Times(1).
		Return(nil, nil)

	err := testservice.PostToConnection(&testconnectionid, testpayloadtext)
	if err != nil {
		t.Errorf("PostToConnection err: %v", err)
	}
}

func TestPostToConnectionMarshalErr(t *testing.T) {
	testpayloadtext := "testpayload"
	testconnectionid := "123"
	want := "test"
	testerr := errors.New(want)

	ctrl := gomock.NewController(t)
	m := mapigwma.NewMockIAWSAPIGWMA(ctrl)

	testservice := ApiGatewayMgmtAPIService{m}

	m.
		EXPECT().
		Marshal(testpayloadtext).
		Times(1).
		Return(nil, testerr)

	err := testservice.PostToConnection(&testconnectionid, testpayloadtext)

	if err == nil {
		t.Errorf("Marshal error failure")
	}

	if err != nil {

		got := err.Error()

		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}

func TestPostToConnectionGoneExceptionErr(t *testing.T) {
	testpayloadtext := "testpayload"
	testpayload := []byte(strconv.Quote(testpayloadtext))
	testconnectionid := "123"
	testinput := &apigw.PostToConnectionInput{
		ConnectionId: &testconnectionid,
		Data:         testpayload,
	}
	want := apigw.ErrCodeGoneException
	testerr := awserr.New(apigw.ErrCodeGoneException, "", errors.New(""))

	ctrl := gomock.NewController(t)
	m := mapigwma.NewMockIAWSAPIGWMA(ctrl)

	testservice := ApiGatewayMgmtAPIService{m}

	m.
		EXPECT().
		Marshal(testpayloadtext).
		Times(1).
		Return(testpayload, nil)

	m.
		EXPECT().
		CreatePostToConnectionInput(&testconnectionid, testpayload).
		Times(1).
		Return(testinput)

	m.
		EXPECT().
		PostToConnection(testinput).
		Times(1).
		Return(nil, testerr)

	err := testservice.PostToConnection(&testconnectionid, testpayloadtext)

	if err == nil {
		t.Errorf("Marshal error failure")
	}

	if err != nil {

		got := err.Error()

		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}

func TestPostToConnectionNonAWSErr(t *testing.T) {
	testpayloadtext := "testpayload"
	testpayload := []byte(strconv.Quote(testpayloadtext))
	testconnectionid := "123"
	testinput := &apigw.PostToConnectionInput{
		ConnectionId: &testconnectionid,
		Data:         testpayload,
	}
	want := "test"
	testerr := errors.New(want)

	ctrl := gomock.NewController(t)
	m := mapigwma.NewMockIAWSAPIGWMA(ctrl)

	testservice := ApiGatewayMgmtAPIService{m}

	m.
		EXPECT().
		Marshal(testpayloadtext).
		Times(1).
		Return(testpayload, nil)

	m.
		EXPECT().
		CreatePostToConnectionInput(&testconnectionid, testpayload).
		Times(1).
		Return(testinput)

	m.
		EXPECT().
		PostToConnection(testinput).
		Times(1).
		Return(nil, testerr)

	err := testservice.PostToConnection(&testconnectionid, testpayloadtext)

	if err == nil {
		t.Errorf("Marshal error failure")
	}

	if err != nil {

		got := err.Error()

		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}
