package cognitojwt

import (
	"context"
	"crypto/rsa"
	"errors"
	"fmt"
	"log"

	"github.com/lestrrat-go/jwx/jwk"
)

func FetchJWKSet(ctx context.Context, uri string) (jwk.Set, error) {
	return jwk.Fetch(context.Background(), uri)
}

func MatchCognitoPubKey(set jwk.Set, claimedKeyID *string) (*rsa.PublicKey, error) {
	for it := set.Iterate(context.Background()); it.Next(context.Background()); {
		pair := it.Pair()
		k := pair.Value.(jwk.Key)
		if k.KeyID() == *claimedKeyID {
			var rawkey interface{} // e.g. *rsa.PrivateKey or *ecdsa.PrivateKey
			if err := k.Raw(&rawkey); err != nil {
				var errMsg error = fmt.Errorf("failed to create public key: %s", err)
				log.Print(errMsg)
				return nil, errMsg
			}
			pubKey, ok := rawkey.(*rsa.PublicKey)
			if !ok {
				var errMsg string = "failed to convert jwk to public key"
				log.Print(errMsg)
				return nil, errors.New(errMsg)
			}
			// rawkey used for jws.Verify()
			return pubKey, nil
		}
	}
	return nil, errors.New("failed to match claimed key id with cognito")
}
