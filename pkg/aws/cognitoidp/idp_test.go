package cognitoidp

import (
	"bytes"
	"crypto/rsa"
	"fmt"
	"io/ioutil"
	"math/big"
	"net/http"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestMatchIdentityProviderJWK(t *testing.T) {
	testkid1 := "test1"
	testkid2 := "test2"
	want := &CognitoJwk{KeyID: testkid1}
	testjwks := CognitoJwks{
		Keys: []*CognitoJwk{
			want,
			{
				KeyID: testkid2,
			},
		},
	}

	got, err := testjwks.matchIdentityProviderJWK(testkid1)
	if err != nil {
		t.Errorf("TestMatchIdentityProviderJWK error: %v", err)
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestMatchIdentityProviderJWKErr(t *testing.T) {
	testkid1 := "test1"
	testkid2 := "test2"
	testjwks := CognitoJwks{
		Keys: []*CognitoJwk{
			{
				KeyID: testkid1,
			},
			{
				KeyID: testkid2,
			},
		},
	}

	want := "error: unmatched public key"

	_, got := testjwks.matchIdentityProviderJWK("doesnt exist")
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGet(t *testing.T) {

	// run a webserver during test
	port := 8090
	localhost := fmt.Sprintf("http://localhost:%d/", port)
	go func() {
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprintf(w, "test")
		})
		if err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil); err != nil {
			t.Errorf("test webserver error: %v", err)
		}
	}()

	testidpdeps := IdpDeps{}
	res, err := testidpdeps.Get(localhost)
	if err != nil {
		t.Errorf("TestGet Get error: %v", err)
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		t.Errorf("TestGet ReadAll error: %v", err)
	}

	got := string(body)
	want := "test"

	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestReadAll(t *testing.T) {

	test := "test"
	testreader := strings.NewReader(test)

	testidpdeps := IdpDeps{}

	got, err := testidpdeps.ReadAll(testreader)
	if err != nil {
		t.Errorf("TestReadAll error: %v", err)
	}

	want := []byte(test)
	if !bytes.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestUnmarshalFromIdpDeps(t *testing.T) {

	testkid1 := "test1"
	testkid2 := "test2"
	testjson := []byte(
		fmt.Sprintf("{\"keys\":[{\"kid\":\"%s\"},{\"kid\":\"%s\"}]}", testkid1, testkid2),
	)

	want := CognitoJwks{
		Keys: []*CognitoJwk{
			{
				KeyID: testkid1,
			},
			{
				KeyID: testkid2,
			},
		},
	}
	got := CognitoJwks{}

	testidpdeps := IdpDeps{}
	err := testidpdeps.Unmarshal(testjson, &got)
	if err != nil {
		t.Errorf("TestUnmarshalFromIdpDeps err: %v", err)
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestMarshal(t *testing.T) {
	testkid := "test"
	want := []byte(
		fmt.Sprintf("{\"kid\":\"%s\",\"alg\":\"\",\"kty\":\"\",\"e\":\"\",\"n\":\"\",\"use\":\"\"}", testkid),
	)
	testjwk := CognitoJwk{
		KeyID: testkid,
	}
	testidpdeps := IdpDeps{}
	got, err := testidpdeps.Marshal(testjwk)
	if err != nil {
		t.Errorf("TestUnmarshalFromIdpDeps err: %v", err)
	}
	if !bytes.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestParseRawKey(t *testing.T) {
	// copied from https://github.com/lestrrat-go/jwx/blob/3fa12c9bedcebd03db23f61cfb65ae0b040bf211/jwk/jwk_test.go#L433-L437
	testjwk := `{
		"e":"AQAB",
		"kty":"RSA",
		"n":"0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw"
	}`
	testidpdeps := IdpDeps{}
	got, err := testidpdeps.ParseRawKey([]byte(testjwk))
	if err != nil {
		t.Errorf("TestParseRawKey err: %v", err)
	}
	testmodulus := new(big.Int)
	testmodulus.SetString("26634547600177008912365441464036882611104634136430581696102639463075266436216946316053845642300166320042915031924501272705275043130211783228252369194856949397782880847235143381529207382262647906987655738647387007320361149854766523417293323739185308113373529512728932838100141612048712597178695720651344295450174895369923383396704334331627261565907266749863744707920606364678231639106403854977302183719246256958550651555767664134467706614553219592981545363271425781391262006405169505726523023628770285432062044391310047445749287563161668548354322560223509946990827691654627968182167826397015368836435965354956581554819", 10)
	want := &rsa.PublicKey{N: testmodulus, E: 65537}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestParseRawKeyErr(t *testing.T) {
	testjwk := `{
		"e":"AQAB",
		"kty":"RSA"
	}`
	testidpdeps := IdpDeps{}
	_, got := testidpdeps.ParseRawKey([]byte(testjwk))
	if got == nil {
		t.Errorf("got nil err")
	}
	want := "failed to parse key: failed to unmarshal JSON into key (*jwk.rsaPublicKey): required field n is missing"
	if got.Error() != want {
		t.Errorf("got %v, want %v", got.Error(), want)
	}
}
