import React from 'react'

import { UserProvider } from 'context/User/UserContext'

export default ({ children }) => <UserProvider>{children}</UserProvider>
