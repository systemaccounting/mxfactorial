package cognitoidp

import (
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"testing"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/go-cmp/cmp"
)

func TestTestTokenErr(t *testing.T) {
	want := "error: token value not set"
	testkey := rsa.PublicKey{}
	testjwtoken := JWToken{}
	_, got := testjwtoken.TestToken(&testkey)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestParseHeader(t *testing.T) {
	want := "test"
	testtoken := fmt.Sprintf("%s.token", want)

	testJwtDeps := JwtDeps{}

	got := testJwtDeps.ParseHeader(testtoken)
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestDecodeSegment(t *testing.T) {
	want := []byte("https://YOUR_DOMAIN/.well-known/jwks.json")
	testb64url := base64.URLEncoding.EncodeToString(want)
	testJwtDeps := JwtDeps{}
	got, err := testJwtDeps.DecodeSegment(testb64url)
	if err != nil {
		t.Errorf("TestDecodeSegment err: %v", err)
	}
	if !bytes.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestUnmarshal(t *testing.T) {
	testtokenvalue := "test"
	testjson := []byte(
		fmt.Sprintf("{\"token\":\"%s\"}", testtokenvalue),
	)

	want := JWToken{Value: &testtokenvalue}
	got := JWToken{}
	testJwtDeps := JwtDeps{}
	err := testJwtDeps.Unmarshal(testjson, &got)
	if err != nil {
		t.Errorf("TestUnmarshal err: %v", err)
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetCognitoClaimsFromJwtDeps(t *testing.T) {
	testclaim := "test"
	want := CognitoClaims{TokenUse: &testclaim}
	testtoken := jwt.Token{Claims: &want}

	testJwtDeps := JwtDeps{}
	got, err := testJwtDeps.GetCognitoClaims(&testtoken)
	if err != nil {
		t.Errorf("TestGetCognitoClaims err: %v", err)
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

type unwantedClaims struct{}

func (unwantedClaims) Valid() error {
	return fmt.Errorf("")
}

func TestGetCognitoClaimsErr(t *testing.T) {
	want := "error: CognitoClaims convert failure"
	testtoken := jwt.Token{Claims: &unwantedClaims{}}

	testJwtDeps := JwtDeps{}
	_, got := testJwtDeps.GetCognitoClaims(&testtoken)
	if got == nil {
		t.Errorf("got nil err, want: %v", want)
	}
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestTestTokenFromJwtDeps(t *testing.T) {

	testtoken := "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.fQEGF80Q26SfgXEBTOLNM3sMo5psp8zMrLBVQGaF1WnfBeqo0H7ZxKnOhkwHrP0_a8ruJW3LX5j3O84iV1CdCr9D-p29hWg6LVs4Q54xrbetqJNqiCgaURPSbZrqKOXg-xJIFtIHlj_J8UZ9R5-X5Hlca9KtLJ9r2vVrM_5aS49gT7nt3prZsT48vQMAcyUIZvQbfu51f4yFGeD45sDW7UBaKFGktebfRPouePM02xoKUAL4ef3yMXbedpJJi146ih21KC5u8pYljBUhqCZuDVlksJ6fnS0XBVrvgQW6uOPBTG81W9Vr2NiGzytODBIom1Zwg29N03hp1WMwHbTXyubpyLjoFSRNM1yomx1-Zm4AdPcLd0tziYTkskoDZPbZ6V3rL4-lf7P6y3gPn7LwJ3z2y6tV0fC9MvPFshJXSKb41-UiVxfJSKaiSgxWLGJIFA58t-NxbByOpEECm0oCCuKTPjTY5Od8RCdysoysQH2PpiDUF17xEhAET8HZuXlu"

	testpubkey := `
-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA7w16Zn9nX56OjrTRSyPX
2oIIYWFjXgDhkZclr6hwcV4rYxCW/assMhy35+CiTTPiwqSEOvZCCippJGaYP1QH
O/no6pudKFFD1oWoKPKF7Q6/ff0m0pBBAMHuzG0tp1ZY9mNKpQodKpZlsZN/fiV1
6nZnJT/HG621VA6DA85W3/uqU0pATQu2ed9dsbGmN7IfXYpy1jDevSbEPWT0KMYj
W9bR++dt9ej/PnDP0SfR6PjHwbjPLLafeMu323B7BA7SbH43Ar5939fFuUke56WH
z/2530LnhwtLCBYFw1Y6+WbYN8KoH1Os6lkl29cOuQH8niOTVbFEYXm0N7l6N/WY
vU1qc1FD1xEQiWk+NguGO+vKdgV2p3YKLVheIWmV6LZYmuDBQJwiIcHyS5//wrIE
9rwzUDYPJ9OqAEg6FnBw6OPSO585EHFGKXWVnixSrHWeMCkDHvL8+pfD4lJae6su
bM6lJ/FvqBYk40psSh1TKizUMVEFcyL8O0x3kIOZMBgFAgMBAAE=
-----END PUBLIC KEY-----`

	pubpem, _ := pem.Decode([]byte(testpubkey))

	parsed, err := x509.ParsePKIXPublicKey(pubpem.Bytes)
	if err != nil {
		t.Errorf("failed to parse pem key")
	}

	testrsapubkey, ok := parsed.(*rsa.PublicKey)
	if !ok {
		t.Errorf("failed to parse pub key")
	}

	testJwtDeps := JwtDeps{}
	got, err := testJwtDeps.TestToken(testtoken, testrsapubkey)
	if err != nil {
		t.Errorf("TestTestTokenFromJwtDeps err: %v", err)
	}

	if !got.Valid {
		t.Errorf("testtoken fail")
	}
}
