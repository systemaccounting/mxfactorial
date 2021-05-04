<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

* `make initial-deploy ENV=dev`: pre-terraform command loops through all service directories in `makefile`, zips, and puts artifacts in s3
* `make deploy ENV=dev`: updates function code in addition to putting each service artifact in s3

\* approx 2.5 minutes to deploy all lambda services