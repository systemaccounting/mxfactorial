package cognitoidp_test // avoids cycle import error from mocks

import (
	"crypto/rsa"
	"fmt"
	"testing"

	"github.com/dgrijalva/jwt-go"
	"github.com/golang/mock/gomock"
	cidp "github.com/systemaccounting/mxfactorial/pkg/aws/cognitoidp"
	mcidp "github.com/systemaccounting/mxfactorial/pkg/aws/cognitoidp/mock_cognitoidp"
)

func TestTestToken(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIJwtDeps(c)

	testkey := &rsa.PublicKey{}

	testtokenvalue := "test"
	testjwtoken := cidp.JWToken{Value: &testtokenvalue, Deps: m}

	m.
		EXPECT().
		TestToken(testtokenvalue, testkey).
		Times(1)

	testjwtoken.TestToken(testkey)
}

func TestGetCognitoClaims(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIJwtDeps(c)

	testjwt := &jwt.Token{}

	testjwtoken := cidp.JWToken{Deps: m}

	m.
		EXPECT().
		GetCognitoClaims(testjwt).
		Times(1)

	testjwtoken.GetCognitoClaims(testjwt)
}

func TestGetClaimedKeyID(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIJwtDeps(c)

	testheader := "test"
	testkeyid := "test"
	testtokenvalue := fmt.Sprintf("%s.token", testheader)
	testurlbytes := []byte("test")
	testjwtoken := cidp.JWToken{Value: &testtokenvalue, Deps: m}

	m.
		EXPECT().
		ParseHeader(testtokenvalue).
		Times(1).
		Return(testheader)

	m.
		EXPECT().
		DecodeSegment(testheader).
		Times(1).
		Return(testurlbytes, nil)

	m.
		EXPECT().
		Unmarshal(testurlbytes, &testjwtoken.Header).
		Times(1).
		DoAndReturn(func(b []byte, d interface{}) error {
			testjwtoken.Header = &struct {
				KeyID *string "json:\"kid\""
				Alg   *string "json:\"alg\""
			}{
				KeyID: &testkeyid,
			}
			return nil
		})

	testjwtoken.GetClaimedKeyID()
}

func TestGetClaimedKeyIDDecodeSegmentErr(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIJwtDeps(c)

	testheader := "test"
	testtokenvalue := fmt.Sprintf("%s.token", testheader)
	testjwtoken := cidp.JWToken{Value: &testtokenvalue, Deps: m}

	want := "testerr"

	m.
		EXPECT().
		ParseHeader(testtokenvalue).
		Times(1).
		Return(testheader)

	m.
		EXPECT().
		DecodeSegment(testheader).
		Times(1).
		Return(nil, fmt.Errorf(want))

	_, got := testjwtoken.GetClaimedKeyID()
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}

	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetClaimedKeyIDUnmarshalErr(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIJwtDeps(c)

	testheader := "test"
	testkeyid := "test"
	testtokenvalue := fmt.Sprintf("%s.token", testheader)
	testurlbytes := []byte("test")
	testjwtoken := cidp.JWToken{Value: &testtokenvalue, Deps: m}

	want := "testerr"

	m.
		EXPECT().
		ParseHeader(testtokenvalue).
		Times(1).
		Return(testheader)

	m.
		EXPECT().
		DecodeSegment(testheader).
		Times(1).
		Return(testurlbytes, nil)

	m.
		EXPECT().
		Unmarshal(testurlbytes, &testjwtoken.Header).
		Times(1).
		DoAndReturn(func(b []byte, d interface{}) error {
			testjwtoken.Header = &struct {
				KeyID *string "json:\"kid\""
				Alg   *string "json:\"alg\""
			}{
				KeyID: &testkeyid,
			}
			return fmt.Errorf(want)
		})

	_, got := testjwtoken.GetClaimedKeyID()
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}

	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
