**INSTALL**
1. Install gcloud sdk using steps outlined at https://cloud.google.com/sdk/gcloud/reference/init
2. Run **gloud init** and complete authorization
3. Run **npm install**
4. Profit! Runs on port 8080

**ENDPOINTS**

/account

.post
Create a new user account with kind 'Account' on google cloud datastore.


**For Testing Purposes**

/account/all

.get
Get all user accounts (with kind 'Account') from google cloud datastore.

.delete
Delete all user accounts (which kind 'Account') from google cloud datastore.