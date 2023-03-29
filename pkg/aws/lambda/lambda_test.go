package lambda

import (
	"fmt"
	"testing"

	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/golang/mock/gomock"
	"github.com/google/go-cmp/cmp"
	mlambda "github.com/systemaccounting/mxfactorial/pkg/aws/lambda/mock_lambda"
)

func TestCreateInvokeInput(t *testing.T) {

	testlambdafnname := "testlambdafnname"

	testlambdaservice := LambdaService{
		IAWSLambda: AWSLambda{FunctionName: &testlambdafnname},
	}

	testbody := []byte("body")

	want := &lambda.InvokeInput{
		FunctionName: &testlambdafnname,
		Payload:      testbody,
	}

	got := testlambdaservice.IAWSLambda.CreateInvokeInput(testbody)

	if !cmp.Equal(got, want) {
		t.Errorf("\ngot: %v\nwant: %v", got, want)
	}
}

func TestInvoke(t *testing.T) {

	ctrl := gomock.NewController(t)

	m := mlambda.NewMockIAWSLambda(ctrl)

	testlambdafnname := "testlambdafnname"
	testbodytxt := "body"
	testbody := []byte(testbodytxt)
	testinput := &lambda.InvokeInput{
		FunctionName: &testlambdafnname,
		Payload:      testbody,
	}
	testoutput := &lambda.InvokeOutput{}
	testreturn := []byte("testreturn")
	testoutput.Payload = testreturn

	m.
		EXPECT().
		Marshal(testbody).
		Times(1).
		Return(testbody, nil)

	m.
		EXPECT().
		CreateInvokeInput(testbody).
		Times(1).
		Return(testinput)

	m.
		EXPECT().
		Invoke(testinput).
		Times(1).
		Return(testoutput, nil)

	testlambdaserv := LambdaService{IAWSLambda: m}

	want := testreturn
	got, err := testlambdaserv.Invoke(testbody)
	if err != nil {
		t.Errorf("Invoke err: %v", err)
	}

	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestInvokeMarshalErr(t *testing.T) {

	ctrl := gomock.NewController(t)

	m := mlambda.NewMockIAWSLambda(ctrl)

	testbodytxt := "body"
	testbody := []byte(testbodytxt)
	testerr := fmt.Errorf("testerr")

	m.
		EXPECT().
		Marshal(testbody).
		Times(1).
		Return(nil, testerr)

	testlambdaserv := LambdaService{IAWSLambda: m}

	want := testerr
	_, got := testlambdaserv.Invoke(testbody)

	if got.Error() != want.Error() {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestInvokeErr(t *testing.T) {

	ctrl := gomock.NewController(t)

	m := mlambda.NewMockIAWSLambda(ctrl)

	testlambdafnname := "testlambdafnname"
	testbodytxt := "body"
	testbody := []byte(testbodytxt)
	testinput := &lambda.InvokeInput{
		FunctionName: &testlambdafnname,
		Payload:      testbody,
	}
	testerr := fmt.Errorf("testerr")

	m.
		EXPECT().
		Marshal(testbody).
		Times(1).
		Return(testbody, nil)

	m.
		EXPECT().
		CreateInvokeInput(testbody).
		Times(1).
		Return(testinput)

	m.
		EXPECT().
		Invoke(testinput).
		Times(1).
		Return(nil, testerr)

	testlambdaserv := LambdaService{IAWSLambda: m}

	want := testerr.Error()
	_, err := testlambdaserv.Invoke(testbody)
	got := err.Error()

	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
