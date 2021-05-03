package cognitojwt

import (
	"crypto/rsa"
	"encoding/json"
	"errors"
	"log"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/lestrrat-go/jwx/jwk"
)

type Token string

type CognitoClaims struct {
	*jwt.StandardClaims
	EmailVerified   *bool   `json:"email_verified"`
	TokenUse        *string `json:"token_use"`
	AuthTime        *int64  `json:"auth_time"`
	CognitoUsername *string `json:"cognito:username"`
	GivenName       *string `json:"given_name"`
	Email           *string `json:"email"`
}

type TokenHeader struct {
	KeyID *string `json:"kid"`
	Alg   *string `json:"alg"`
}

func (t *Token) GetAuthAccount(jwkSet jwk.Set) (string, error) {
	// get claimed key id
	claimedKeyID, err := GetClaimedKeyID(*t)
	if err != nil {
		var errMsg string = "get claimed key id: %v"
		log.Printf(errMsg, err)
		return "", errors.New(errMsg)
	}

	// match claimed key id with cognito jwk index
	cognitoPub, err := MatchCognitoPubKey(jwkSet, claimedKeyID)
	if err != nil {
		var errMsg string = "failed to match cognito web key: %v"
		log.Printf(errMsg, err)
		return "", errors.New(errMsg)
	}

	// test client token
	testedToken, err := TestToken(string(*t), cognitoPub)
	if err != nil {
		var errMsg string = "token auth failed: %v"
		log.Printf(errMsg, err)
		return "", errors.New(errMsg)
	}

	// get token claims
	claims := testedToken.Claims.(*CognitoClaims)

	// return account name from cognito token
	return *claims.CognitoUsername, nil
}

func TestToken(tokenString string, verifyKey *rsa.PublicKey) (*jwt.Token, error) {
	return jwt.ParseWithClaims(tokenString, &CognitoClaims{}, func(token *jwt.Token) (interface{}, error) {
		return verifyKey, nil
	})
}

func GetClaimedKeyID(t Token) (*string, error) {
	header := strings.Split(string(t), ".")[0]
	b, err := jwt.DecodeSegment(header)
	if err != nil {
		return nil, err
	}
	var th TokenHeader
	err = json.Unmarshal(b, &th)
	if err != nil {
		return nil, err
	}
	return th.KeyID, nil
}
