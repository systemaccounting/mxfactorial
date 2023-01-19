package httpclient

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws/credentials"
	v4 "github.com/aws/aws-sdk-go/aws/signer/v4"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
)

type HttpClient struct {
	*http.Client
	Url string
}

func (h *HttpClient) Post(b []byte) ([]byte, error) {

	br := bytes.NewReader(b)

	req, err := http.NewRequest(http.MethodPost, h.Url, br)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")

	// https://docs.amazonaws.cn/en_us/opensearch-service/latest/developerguide/request-signing.html

	if os.Getenv("AWS_LAMBDA_FUNCTION_NAME") != "" {

		creds := credentials.NewEnvCredentials()
		signer := v4.NewSigner(creds)

		_, err = signer.Sign(req, br, "lambda", os.Getenv("AWS_REGION"), time.Now())

		if err != nil {
			logger.Log(logger.Trace(), err)
			return nil, err
		}
	}

	resp, err := h.Client.Do(req)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	resp.Body.Close()

	return body, nil
}

func NewHttpClient(url string) *HttpClient {
	return &HttpClient{
		Client: new(http.Client),
		Url:    url,
	}
}
