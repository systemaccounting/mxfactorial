package service

import (
	"fmt"
	"os"

	cidp "github.com/systemaccounting/mxfactorial/services/gopkg/aws/cognitoidp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
)

type AuthService struct {
	j cidp.ICognitoJwks
}

func (a AuthService) AuthAccount(
	t *cidp.JWToken,
	tempAccount *string,
) (string, error) {

	if os.Getenv("ENABLE_API_AUTH") == "true" { // auth with cognito

		if t.Value == nil {
			err := fmt.Errorf("error: token missing")
			logger.Log(logger.Trace(), err)
			return "", err
		}

		return a.j.GetCognitoUser(t)

	} else { // or override with temp account

		if tempAccount == nil {
			err := fmt.Errorf("error: temp account missing")
			logger.Log(logger.Trace(), err)
			return "", err
		}

		return *tempAccount, nil
	}

}

func NewAuthService(j *cidp.CognitoJwks) *AuthService {
	return &AuthService{j}
}
