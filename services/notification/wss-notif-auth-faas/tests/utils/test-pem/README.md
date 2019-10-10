<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

## jwt sign cognito test token

1. `docker pull centos:latest`
    \* avoids `openssl ... -inform` errors on macos:
    ```bash
    $ openssl rsa -pubin -inform PEM -text -noout < rsa_pub.pem
    unable to load Public Key
    140736239469576:error:0906D06C:PEM routines:PEM_read_bio:no start line:pem_lib.c:707:Expecting: PUBLIC KEY
    ```
1. `cd services/notification/websocket-faas/src/utils/test-pem && export MOUNT_DIR=$(pwd)` if versioning directory contents. otherwise `mkdir ~/keystore && export MOUNT_DIR=~/keystore` to create separate directory for centos container mount
1. `docker run -it --volume $MOUNT_DIR:/root/keystore --name centos-keys centos:latest bash`
1. `yum update -y`
1. `yum install openssl -y`
    ### create test keys and save information
1. `cd /root/keystore` in new centos-keys container command line
1. [create rsa key](https://stackoverflow.com/a/29011321): `openssl genrsa -out key.pem 1024`
1. save key.pem inform output: `openssl rsa -in key.pem -text -noout > key.inform`
1. create public key: `openssl rsa -in key.pem -pubout -out pub.pem`
1. save pub.pem inform outout: `openssl rsa -in pub.pem -pubin -text -noout > pub.inform`
    ### create test token
1. add [yarn yum repo](https://yarnpkg.com/lang/en/docs/install/#centos-stable): `curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo`
1. add node yum repo: `curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -`
1. `yum install yarn -y`
1. `yarn init -y`
1. `yarn add jsonwebtoken`
1. `vi jwt.js`
1. `i` to insert
1. paste into `jwt.js`:
    ```javascript
    const jwt = require('jsonwebtoken')
    const fs = require('fs')
    const key = fs.readFileSync('./key.pem')

    const headerObj = { kid: '12345678901234567890123456789123456789123456=', alg: 'RS256' }

    const payloadObj = {
      sub: '12345678-1234-1234-1234-123456789012',
      aud: '12345678901234567890123456',
      event_id: '12345678-1234-5678-9123-123456789012',
      token_use: 'ab',
      auth_time: 1234567890,
      iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789',
      'cognito:username': 'testacct',
      exp: 1234567890,
      iat: 1234567890
    }

    const opts = {
      algorithm: 'RS256',
      header: headerObj
    }

    const token = jwt.sign(payloadObj, key, opts)

    console.log(token)
    fs.writeFileSync('token', token)
    ```
1. `esc` to discontinue insert
1. `:wq` and `enter` to save
1. `node /root/keystore/jwt.js` to save signed `/root/keystore/token`
    ### create test json web key
1. `vi jwk.js`
1. `i` to insert
1. paste into `jwk.js`:
    ```javascript
    const fs = require('fs')

    const exponentValue = ``
    const modulusValue = ``

    const encode = data => {
      let buff = Buffer.from(data)
      return buff.toString('base64')
    }
    const encodedExponentValue = encode(exponentValue)
    const encodedModulusValue = encode(modulusValue)

    const jwk = {
      "kid": "12345678901234567890123456789123456789123456=",
      "alg": "RS256",
      "kty": "RSA",
      "e": encodedExponentValue,
      "n": encodedModulusValue,
      "use": "sig"
    }
    const jwkJson = JSON.stringify(jwk)

    console.log(jwkJson)
    fs.writeFileSync('jwk.json', jwkJson)
    ```
1. reassign empty `exponentValue` and `modulusValue` template literals to values stored in `pub.inform`:
    ```javascript
    const exponentValue = `00:f7:19:39:f2:1f:86:11:07:42:c4:78:4b:f2:3f:
    64:cd:43:dc:60:6f:16:15:53:d8:67:e3:bb:15:2c:
    19:1c:bd:0d:fa:0a:2b:9b:7e:22:33:03:60:57:4a:
    d7:62:02:59:99:fb:ec:9b:66:2a:47:3d:14:b8:b1:
    1d:5d:56:4d:7a:1d:35:c5:ce:fd:fa:d4:97:5e:11:
    ef:72:0f:e8:1d:b6:44:50:54:75:25:bb:7d:61:64:
    4f:b5:a6:d0:8d:d9:47:92:62:2e:c5:37:ba:e4:ea:
    7e:da:1d:3f:9b:1e:95:0a:35:90:9c:f9:65:14:a9:
    1d:7d:f1:f2:f7:cc:d7:ff:e1`
    const modulusValue = `65537`
    ```
1. `esc` to discontinue insert
1. `:wq` and `enter` to save
1. `node /root/keystore/jwk.js` to save `/root/keystore/jwk.json`
    ### reference pem, token and jwt in ../testConstants.js
1. add in `../testConstants.js`:
    1. `TEST_TOKEN: fs.readFileSync(__dirname + '/test-pem/token', 'ascii')`
    1. `TEST_PUBLIC_PEM: fs.readFileSync(__dirname + '/test-pem/pub.pem', 'ascii')`
    1. `TEST_KEY: fs.readFileSync(__dirname + '/test-pem/jwk.json', 'ascii')`