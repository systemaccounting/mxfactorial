package cognitoidp

import (
	"crypto/rsa"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

const ErrTokenValueNotSet = "error: token value not set"
const ErrCognitoClaims = "error: CognitoClaims convert failure"

type JWToken struct {
	Value  *string `json:"token"`
	Header *struct {
		KeyID *string `json:"kid"`
		Alg   *string `json:"alg"`
	}
	Deps IJwtDeps
}

func (j JWToken) TestToken(verifyKey *rsa.PublicKey) (*jwt.Token, error) {
	if j.Value == nil {
		return nil, fmt.Errorf(ErrTokenValueNotSet)
	}
	return j.Deps.TestToken(*j.Value, verifyKey)
}

func (j JWToken) GetCognitoClaims(testedToken *jwt.Token) (CognitoClaims, error) {
	return j.Deps.GetCognitoClaims(testedToken)
}

func (j *JWToken) GetClaimedKeyID() (string, error) {

	header := j.Deps.ParseHeader(*j.Value)

	b, err := j.Deps.DecodeSegment(header)
	if err != nil {
		return "", err
	}

	err = j.Deps.Unmarshal(b, &j.Header)
	if err != nil {
		return "", err
	}

	return *j.Header.KeyID, nil
}

type IJwtDeps interface {
	ParseHeader(s string) string
	DecodeSegment(header string) ([]byte, error)
	Unmarshal(data []byte, v interface{}) error
	TestToken(token string, verifyKey *rsa.PublicKey) (*jwt.Token, error)
	GetCognitoClaims(testedToken *jwt.Token) (CognitoClaims, error)
}

type JwtDeps struct{}

func (j JwtDeps) TestToken(token string, verifyKey *rsa.PublicKey) (*jwt.Token, error) {
	return jwt.ParseWithClaims(token, &CognitoClaims{}, func(token *jwt.Token) (interface{}, error) {
		return verifyKey, nil
	})
}

func (JwtDeps) ParseHeader(s string) string {
	return strings.Split(s, ".")[0]
}

func (JwtDeps) DecodeSegment(header string) ([]byte, error) {
	return jwt.DecodeSegment(header)
}

func (JwtDeps) Unmarshal(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

func (JwtDeps) GetCognitoClaims(testedToken *jwt.Token) (CognitoClaims, error) {
	claims, ok := testedToken.Claims.(*CognitoClaims)
	if !ok {
		return CognitoClaims{}, errors.New(ErrCognitoClaims)
	}
	return *claims, nil
}

func NewJWToken(token string) *JWToken {
	return &JWToken{
		Value: &token,
		Deps:  new(JwtDeps),
	}
}
