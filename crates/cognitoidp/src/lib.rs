use jsonwebtoken::{
    decode, errors,
    jwk::{Jwk, JwkSet},
    Algorithm, DecodingKey, Validation,
};
use serde::Deserialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum IdpError {
    #[error("zero json web keys returned from cognito")]
    ZeroJsonWebKeysReturned,
    #[error(transparent)]
    RequestError(#[from] reqwest::Error),
    #[error("json web key not found in cognito jwk set")]
    JsonWebKeyNotFound,
    #[error(transparent)]
    DecodingKey(#[from] errors::Error),
    #[error("api auth disabled")]
    ApiAuthDisabled,
}

#[derive(Deserialize, Debug)]
pub struct CognitoClaims {
    // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html
    #[serde(rename = "cognito:username")]
    cognito_username: String,
}

#[derive(Deserialize, Debug)]
pub struct CognitoJwkSet(JwkSet);

impl CognitoJwkSet {
    pub async fn new(cognito_jwks_uri: &str) -> Result<Self, IdpError> {
        let response = reqwest::get(cognito_jwks_uri)
            .await
            .map_err(IdpError::RequestError)?;
        let jwks = response.json::<JwkSet>().await.unwrap();
        if jwks.keys.is_empty() {
            return Err(IdpError::ZeroJsonWebKeysReturned);
        }
        Ok(Self(jwks))
    }

    pub fn match_jwk(&self, claimed_key_id: &str) -> Option<&Jwk> {
        self.0.find(claimed_key_id)
    }

    pub fn pub_key(&self, claimed_key_id: &str) -> Result<DecodingKey, IdpError> {
        let jwk = self
            .match_jwk(claimed_key_id)
            .ok_or(IdpError::JsonWebKeyNotFound)?;
        DecodingKey::from_jwk(jwk).map_err(|_| IdpError::JsonWebKeyNotFound)
    }

    pub fn test_token(&self, token: &str) -> Result<CognitoClaims, IdpError> {
        let header = jsonwebtoken::decode_header(token).map_err(IdpError::DecodingKey)?;
        let jwk = self
            .match_jwk(&header.kid.unwrap())
            .ok_or(IdpError::JsonWebKeyNotFound)?;
        let key = DecodingKey::from_jwk(jwk).map_err(|_| IdpError::JsonWebKeyNotFound)?;
        // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-2
        let claims = decode::<CognitoClaims>(token, &key, &Validation::new(Algorithm::RS256))
            .map_err(IdpError::DecodingKey)?;
        Ok(claims.claims)
    }

    pub fn cognito_user(&self, token: &str) -> Result<String, IdpError> {
        self.test_token(token).map(|claims| claims.cognito_username)
    }
}
