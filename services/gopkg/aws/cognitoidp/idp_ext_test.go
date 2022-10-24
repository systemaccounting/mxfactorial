package cognitoidp_test // avoids cycle import error from mocks

import (
	"bytes"
	"crypto/rsa"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/dgrijalva/jwt-go"
	"github.com/golang/mock/gomock"
	cidp "github.com/systemaccounting/mxfactorial/services/gopkg/aws/cognitoidp"
	mcidp "github.com/systemaccounting/mxfactorial/services/gopkg/aws/cognitoidp/mock_cognitoidp"
)

func TestGetCognitoUser(t *testing.T) {
	c := gomock.NewController(t)
	midp := mcidp.NewMockIIdpDeps(c)
	mjwt := mcidp.NewMockIJwToken(c)

	testkid := "test"
	testjwk := &cidp.CognitoJwk{KeyID: testkid}
	testjwks := cidp.CognitoJwks{
		Keys:    []*cidp.CognitoJwk{testjwk},
		IdpDeps: midp,
	}
	testdata := []byte("")
	testpubkey := &rsa.PublicKey{}
	testjwt := &jwt.Token{}
	testuser := "test"
	testclaims := cidp.CognitoClaims{CognitoUsername: &testuser}

	mjwt.
		EXPECT().
		GetClaimedKeyID().
		Times(1).
		Return(testkid, nil)

	midp.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(testdata, nil)

	midp.
		EXPECT().
		ParseRawKey(testdata).
		Times(1).
		Return(testpubkey, nil)

	mjwt.
		EXPECT().
		TestToken(testpubkey).
		Times(1).
		Return(testjwt, nil)

	mjwt.
		EXPECT().
		GetCognitoClaims(testjwt).
		Times(1).
		Return(testclaims, nil)

	testjwks.GetCognitoUser(mjwt)
}

func TestGetCognitoUserErr1(t *testing.T) {
	c := gomock.NewController(t)
	midp := mcidp.NewMockIIdpDeps(c)
	mjwt := mcidp.NewMockIJwToken(c)

	testkid := "test"
	testjwk := &cidp.CognitoJwk{KeyID: testkid}
	testjwks := cidp.CognitoJwks{
		Keys:    []*cidp.CognitoJwk{testjwk},
		IdpDeps: midp,
	}
	testdata := []byte("")
	testpubkey := &rsa.PublicKey{}

	want := "test"
	testerr := fmt.Errorf(want)

	mjwt.
		EXPECT().
		GetClaimedKeyID().
		Times(1).
		Return(testkid, nil)

	midp.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(testdata, nil)

	midp.
		EXPECT().
		ParseRawKey(testdata).
		Times(1).
		Return(testpubkey, nil)

	mjwt.
		EXPECT().
		TestToken(testpubkey).
		Times(1).
		Return(nil, testerr)

	_, got := testjwks.GetCognitoUser(mjwt)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetCognitoUserErr2(t *testing.T) {
	c := gomock.NewController(t)
	midp := mcidp.NewMockIIdpDeps(c)
	mjwt := mcidp.NewMockIJwToken(c)

	testkid := "test"
	testjwk := &cidp.CognitoJwk{KeyID: testkid}
	testjwks := cidp.CognitoJwks{
		Keys:    []*cidp.CognitoJwk{testjwk},
		IdpDeps: midp,
	}
	testdata := []byte("")

	want := "test"
	testerr := fmt.Errorf(want)

	mjwt.
		EXPECT().
		GetClaimedKeyID().
		Times(1).
		Return(testkid, nil)

	midp.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(testdata, nil)

	midp.
		EXPECT().
		ParseRawKey(testdata).
		Times(1).
		Return(nil, testerr)

	_, got := testjwks.GetCognitoUser(mjwt)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetCognitoUserErr3(t *testing.T) {
	c := gomock.NewController(t)
	midp := mcidp.NewMockIIdpDeps(c)
	mjwt := mcidp.NewMockIJwToken(c)

	testkid := "test"
	testjwk := &cidp.CognitoJwk{KeyID: testkid}
	testjwks := cidp.CognitoJwks{
		Keys:    []*cidp.CognitoJwk{testjwk},
		IdpDeps: midp,
	}
	testdata := []byte("")
	testpubkey := &rsa.PublicKey{}
	testjwt := &jwt.Token{}

	want := "test"
	testerr := fmt.Errorf(want)

	mjwt.
		EXPECT().
		GetClaimedKeyID().
		Times(1).
		Return(testkid, nil)

	midp.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(testdata, nil)

	midp.
		EXPECT().
		ParseRawKey(testdata).
		Times(1).
		Return(testpubkey, nil)

	mjwt.
		EXPECT().
		TestToken(testpubkey).
		Times(1).
		Return(testjwt, nil)

	mjwt.
		EXPECT().
		GetCognitoClaims(testjwt).
		Times(1).
		Return(cidp.CognitoClaims{}, testerr)

	_, got := testjwks.GetCognitoUser(mjwt)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetPubKey(t *testing.T) {
	c := gomock.NewController(t)
	midp := mcidp.NewMockIIdpDeps(c)
	mkeyid := mcidp.NewMockIGetClaimedKeyID(c)
	testkid := "test"
	testjwk := &cidp.CognitoJwk{KeyID: testkid}
	testjwks := cidp.CognitoJwks{
		Keys:    []*cidp.CognitoJwk{testjwk},
		IdpDeps: midp,
	}
	testdata := []byte("")
	testpubkey := &rsa.PublicKey{}

	mkeyid.
		EXPECT().
		GetClaimedKeyID().
		Times(1).
		Return(testkid, nil)

	midp.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(testdata, nil)

	midp.
		EXPECT().
		ParseRawKey(testdata).
		Times(1).
		Return(testpubkey, nil)

	testjwks.GetPubKey(mkeyid)
}

func TestGetPubKeyErr(t *testing.T) {
	c := gomock.NewController(t)
	midp := mcidp.NewMockIIdpDeps(c)
	mkeyid := mcidp.NewMockIGetClaimedKeyID(c)
	testjwks := cidp.CognitoJwks{
		Keys:    []*cidp.CognitoJwk{{}},
		IdpDeps: midp,
	}
	want := "test"
	testerr := fmt.Errorf(want)

	mkeyid.
		EXPECT().
		GetClaimedKeyID().
		Times(1).
		Return("", testerr)

	_, got := testjwks.GetPubKey(mkeyid)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestFetch(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	testuri := "testuri"
	testdata := []byte("")
	testresponse := new(http.Response)
	testbody := io.NopCloser(bytes.NewReader(testdata))
	testresponse.Body = testbody
	testjwks := &cidp.CognitoJwks{
		Uri:     testuri,
		Keys:    []*cidp.CognitoJwk{{}, {}},
		IdpDeps: m,
	}

	m.
		EXPECT().
		Get(testuri).
		Times(1).
		Return(testresponse, nil)

	m.
		EXPECT().
		ReadAll(testbody).
		Times(1).
		Return(testdata, nil)

	m.
		EXPECT().
		Unmarshal(testdata, &testjwks).
		Times(1)

	if err := testjwks.Fetch(); err != nil {
		t.Errorf("Fetch error %v", err)
	}
}

func TestFetchErr1(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	want := "test"
	testerr := fmt.Errorf(want)
	testuri := "testuri"
	testdata := []byte("")
	testresponse := new(http.Response)
	testbody := io.NopCloser(bytes.NewReader(testdata))
	testresponse.Body = testbody
	testjwks := &cidp.CognitoJwks{
		Uri:     testuri,
		Keys:    []*cidp.CognitoJwk{{}, {}},
		IdpDeps: m,
	}

	m.
		EXPECT().
		Get(testuri).
		Times(1).
		Return(nil, testerr)

	got := testjwks.Fetch()
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestFetchErr2(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	want := "test"
	testerr := fmt.Errorf(want)
	testuri := "testuri"
	testdata := []byte("")
	testresponse := new(http.Response)
	testbody := io.NopCloser(bytes.NewReader(testdata))
	testresponse.Body = testbody
	testjwks := &cidp.CognitoJwks{
		Uri:     testuri,
		Keys:    []*cidp.CognitoJwk{{}, {}},
		IdpDeps: m,
	}

	m.
		EXPECT().
		Get(testuri).
		Times(1).
		Return(testresponse, nil)

	m.
		EXPECT().
		ReadAll(testbody).
		Times(1).
		Return(nil, testerr)

	got := testjwks.Fetch()
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestFetchErr3(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	want := "test"
	testerr := fmt.Errorf(want)
	testuri := "testuri"
	testdata := []byte("")
	testresponse := new(http.Response)
	testbody := io.NopCloser(bytes.NewReader(testdata))
	testresponse.Body = testbody
	testjwks := &cidp.CognitoJwks{
		Uri:     testuri,
		Keys:    []*cidp.CognitoJwk{{}, {}},
		IdpDeps: m,
	}
	m.
		EXPECT().
		Get(testuri).
		Times(1).
		Return(testresponse, nil)

	m.
		EXPECT().
		ReadAll(testbody).
		Times(1).
		Return(testdata, nil)

	m.
		EXPECT().
		Unmarshal(testdata, &testjwks).
		Times(1).
		Return(testerr)

	got := testjwks.Fetch()
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestFetchErr4(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	testuri := "testuri"
	testdata := []byte("")
	testresponse := new(http.Response)
	testbody := io.NopCloser(bytes.NewReader(testdata))
	testresponse.Body = testbody
	testjwks := &cidp.CognitoJwks{
		Uri:     testuri,
		Keys:    nil, // keys missing
		IdpDeps: m,
	}
	m.
		EXPECT().
		Get(testuri).
		Times(1).
		Return(testresponse, nil)

	m.
		EXPECT().
		ReadAll(testbody).
		Times(1).
		Return(testdata, nil)

	m.
		EXPECT().
		Unmarshal(testdata, &testjwks).
		Times(1)

	want := "error: failed to fetch json web keys"
	got := testjwks.Fetch()
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestMatchIdentityProviderPublicKey(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	testkid1 := "test1"
	testkid2 := "test2"
	testrawkey := []byte("")
	testjwk := &cidp.CognitoJwk{KeyID: testkid1}
	testjwks := cidp.CognitoJwks{
		Keys: []*cidp.CognitoJwk{
			testjwk,
			{
				KeyID: testkid2,
			},
		},
		IdpDeps: m,
	}

	m.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(testrawkey, nil)

	m.
		EXPECT().
		ParseRawKey(testrawkey).
		Times(1)

	testjwks.MatchIdentityProviderPublicKey(testkid1)
}

func TestMatchIdentityProviderPublicKeyErr1(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	testkid1 := "test1"
	testkid2 := "test2"
	testjwk := &cidp.CognitoJwk{KeyID: testkid1}
	testjwks := cidp.CognitoJwks{
		Keys: []*cidp.CognitoJwk{
			testjwk,
			{
				KeyID: testkid2,
			},
		},
		IdpDeps: m,
	}

	want := "error: unmatched public key"

	_, got := testjwks.MatchIdentityProviderPublicKey("doest exist")
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestMatchIdentityProviderPublicKeyErr2(t *testing.T) {
	c := gomock.NewController(t)
	m := mcidp.NewMockIIdpDeps(c)

	testkid1 := "test1"
	testkid2 := "test2"
	want := "test"
	testerr := fmt.Errorf(want)
	testjwk := &cidp.CognitoJwk{KeyID: testkid1}
	testjwks := cidp.CognitoJwks{
		Keys: []*cidp.CognitoJwk{
			testjwk,
			{
				KeyID: testkid2,
			},
		},
		IdpDeps: m,
	}

	m.
		EXPECT().
		Marshal(testjwk).
		Times(1).
		Return(nil, testerr)

	_, got := testjwks.MatchIdentityProviderPublicKey(testkid1)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
