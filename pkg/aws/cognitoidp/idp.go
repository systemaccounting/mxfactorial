package cognitoidp

import (
	"crypto/rsa"
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/lestrrat-go/jwx/jwk"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
)

const ErrUnmatchedPubKey = "error: unmatched public key"
const ErrFetchJwks = "error: failed to fetch json web keys"

type CognitoClaims struct {
	*jwt.StandardClaims
	EmailVerified   *bool   `json:"email_verified"`
	TokenUse        *string `json:"token_use"`
	AuthTime        *int64  `json:"auth_time"`
	CognitoUsername *string `json:"cognito:username"`
	GivenName       *string `json:"given_name"`
	Email           *string `json:"email"`
}

type CognitoJwks struct {
	IdpDeps IIdpDeps
	Keys    []*CognitoJwk `json:"keys"`
	Uri     string
}

// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-2
type CognitoJwk struct {
	KeyID       string `json:"kid"`
	Algorithm   string `json:"alg"`
	KeyType     string `json:"kty"`
	RSAExponent string `json:"e"`
	RSAModulus  string `json:"n"`
	Use         string `json:"use"`
}

type IGetClaimedKeyID interface {
	GetClaimedKeyID() (string, error)
}

type ICognitoJwks interface {
	GetPubKey(token IGetClaimedKeyID) (*rsa.PublicKey, error)
	MatchIdentityProviderPublicKey(claimedKeyID string) (*rsa.PublicKey, error)
	GetCognitoUser(t IJwToken) (string, error)
}

type IJwToken interface {
	TestToken(*rsa.PublicKey) (*jwt.Token, error)
	GetCognitoClaims(*jwt.Token) (CognitoClaims, error)
	IGetClaimedKeyID
}

func (c CognitoJwks) GetCognitoUser(t IJwToken) (string, error) {

	// get matching public rsa from json web key
	// after matching with key id from token
	pubKey, err := c.GetPubKey(t)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// test client token with public key
	testedToken, err := t.TestToken(pubKey)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// get token claims
	claims, err := t.GetCognitoClaims(testedToken)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// return account name from cognito token
	return *claims.CognitoUsername, nil
}

func (c CognitoJwks) GetPubKey(token IGetClaimedKeyID) (*rsa.PublicKey, error) {

	// get claimed key id
	claimedKeyID, err := token.GetClaimedKeyID()
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// match claimed key id with cognito public key
	return c.MatchIdentityProviderPublicKey(claimedKeyID)
}

func (c *CognitoJwks) Fetch() error {

	resp, err := c.IdpDeps.Get(c.Uri)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	data, err := c.IdpDeps.ReadAll(resp.Body)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	err = c.IdpDeps.Unmarshal(data, &c)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	if len(c.Keys) == 0 {
		return errors.New(ErrFetchJwks)
	}

	return nil
}

func (c CognitoJwks) MatchIdentityProviderPublicKey(claimedKeyID string) (*rsa.PublicKey, error) {

	cjwk, err := c.matchIdentityProviderJWK(claimedKeyID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	b, err := c.IdpDeps.Marshal(cjwk)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return c.IdpDeps.ParseRawKey(b)
}

func (c CognitoJwks) matchIdentityProviderJWK(claimedKeyID string) (*CognitoJwk, error) {

	for _, v := range c.Keys {
		if v.KeyID == claimedKeyID {
			return v, nil
		}
	}

	return nil, errors.New(ErrUnmatchedPubKey)
}

type IIdpDeps interface {
	Get(uri string) (*http.Response, error)
	ReadAll(r io.Reader) ([]byte, error)
	Unmarshal(d []byte, i interface{}) error
	Marshal(v interface{}) ([]byte, error)
	ParseRawKey(rawKey []byte) (*rsa.PublicKey, error)
}

type IdpDeps struct{}

func (IdpDeps) Get(uri string) (*http.Response, error) {
	return http.Get(uri)
}

func (IdpDeps) ReadAll(r io.Reader) ([]byte, error) {
	return io.ReadAll(r)
}

func (IdpDeps) Unmarshal(d []byte, i interface{}) error {
	return json.Unmarshal(d, i)
}

func (IdpDeps) Marshal(v interface{}) ([]byte, error) {
	return json.Marshal(v)
}

func (IdpDeps) ParseRawKey(rawKey []byte) (*rsa.PublicKey, error) {
	pubKey := new(rsa.PublicKey)
	err := jwk.ParseRawKey(rawKey, pubKey)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}
	return pubKey, nil
}

func NewCognitoJwks(uri string) *CognitoJwks {
	return &CognitoJwks{
		IdpDeps: new(IdpDeps),
		Uri:     uri,
	}
}
