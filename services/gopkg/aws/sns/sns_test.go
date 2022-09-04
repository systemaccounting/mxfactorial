package sns

import (
	"fmt"
	"testing"

	"github.com/aws/aws-sdk-go/service/sns"
	"github.com/golang/mock/gomock"
	"github.com/google/go-cmp/cmp"
	msns "github.com/systemaccounting/mxfactorial/services/gopkg/aws/sns/mock_sns"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestCreateSNSAttributes(t *testing.T) {

	testservicename := "testservicename"

	want := snsMsgAttributes{
		snsMsgAttributeName: &sns.MessageAttributeValue{
			DataType:    &snsMsgAttributeValueDataType,
			StringValue: &testservicename,
		},
	}

	got := createSNSAttributes(&testservicename)

	if !cmp.Equal(got, want) {
		t.Errorf("\ngot: %v\nwant: %v", got, want)
	}
}

func TestCreatePublishInput(t *testing.T) {

	testid1 := types.ID("1")
	testid2 := types.ID("2")
	testservicename := "testservicename"
	testtopicarn := "testtopicarn"
	testmarshaledids := `["1","2"]`
	testnotifids := types.IDs{
		&testid1,
		&testid2,
	}

	want := &sns.PublishInput{
		Message:           &testmarshaledids,
		TopicArn:          &testtopicarn,
		MessageAttributes: createSNSAttributes(&testservicename),
	}

	got, err := createPublishInput(
		testnotifids,
		&testservicename,
		&testtopicarn,
	)
	if err != nil {
		t.Errorf("createPublishInput error: %v", err)
	}

	if !cmp.Equal(got, want) {
		t.Errorf("\ngot: %v\nwant: %v", got, want)
	}

}

func TestPublish(t *testing.T) {

	ctrl := gomock.NewController(t)
	m := msns.NewMockISNS(ctrl)

	testid1 := types.ID("1")
	testid2 := types.ID("2")
	testservicename := "testservicename"
	testtopicarn := "testtopicarn"
	testmarshaledids := `["1","2"]`

	testnotifids := types.IDs{
		&testid1,
		&testid2,
	}

	want := &sns.PublishInput{
		Message:           &testmarshaledids,
		TopicArn:          &testtopicarn,
		MessageAttributes: createSNSAttributes(&testservicename),
	}

	testsns := SNS{ISNS: m}

	m.
		EXPECT().
		PublishMessage(want).
		Times(1).
		Return(nil, nil)

	err := testsns.Publish(
		testnotifids,
		&testservicename,
		&testtopicarn,
	)

	if err != nil {
		t.Errorf("Publish error: %v", err)
	}
}

func TestPublishErr(t *testing.T) {

	ctrl := gomock.NewController(t)
	m := msns.NewMockISNS(ctrl)

	testid1 := types.ID("1")
	testid2 := types.ID("2")
	testservicename := "testservicename"
	testtopicarn := "testtopicarn"
	testmarshaledids := `["1","2"]`

	want := "testerr"
	testerr := fmt.Errorf(want)

	testnotifids := types.IDs{
		&testid1,
		&testid2,
	}

	testinput := &sns.PublishInput{
		Message:           &testmarshaledids,
		TopicArn:          &testtopicarn,
		MessageAttributes: createSNSAttributes(&testservicename),
	}

	testsns := SNS{ISNS: m}

	m.
		EXPECT().
		PublishMessage(testinput).
		Times(1).
		Return(nil, testerr)

	err := testsns.Publish(
		testnotifids,
		&testservicename,
		&testtopicarn,
	)

	got := err.Error()

	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
