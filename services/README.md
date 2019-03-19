<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

* `bash build.sh`: loops through all projects in this directory, installs their dependencies, then creates .zip files in each directory  
* `bash deploy.sh dev`: in addition to building each project (`bash build.sh`), deploys all to a single environment passed as `dev`, `qa` or `prod` string. environment options available from `terraform/environments/` (excluding `global` and `common-bin`)

note: `cd services` required before executing scripts  