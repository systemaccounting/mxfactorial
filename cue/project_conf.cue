package project_conf

#AppType: *"app" | "lib" | "tool"
#Runtime: *"rust1.x" | "bash"
#RustLog: "off"

#EnvVar: {
    ssm!: *null | string
    default!: *null | string | int | bool | [...string]
}

#EnvVars: {
    set!: [string]: #EnvVar
    get!: [...string]
}

#Params: [...string] // todo: remove

#Dir: {
    env_var!: #EnvVars
    params!: #Params
}

".github": {
    #Dir
    codecov: {
        flags: [...string]
    }
    workflows: {
        env_var!: #EnvVars
        params!: #Params
    }
}

#App: {
    #Dir
    runtime!: #Runtime
    min_code_cov!: *null | int
    type!: #AppType
    local_dev!: *false | bool
    deploy!: *true | bool
    build_src_path!: *null | string
    dependents!: [...string]
    rust_log!: #RustLog
}

client!: {
    #Dir
    runtime!: "v8"
    min_code_cov!: null
    type!: #AppType
    local_dev!: *false | bool
    deploy!: *true | bool
}

#Lib: {
    runtime!: #Runtime
    min_code_cov!: *null | int
    type!: #AppType
    env_var!: #EnvVars
    params!: #Params
}

crates: {
    #Dir
    httpclient: #Lib
    pg: #Lib
    types: #Lib
    uribuilder: #Lib
    wsclient: #Lib
}

docker: {
    env_var!: #EnvVars
}

infra: {
    terraform: {
        env_var!: #EnvVars
        aws: {
            environments: {
                region: {
                    env_var!: #EnvVars
                }
            }
            modules: {
                env_var!: #EnvVars
                environment: {
                    env_var!: #EnvVars
                }
                microk8s: {
                    env_var!: #EnvVars
                }
                "project-storage": {
                    env_var!: #EnvVars
                }
            }
        }
    }
}

k8s: {
    local: {
        #Dir
        type!: #AppType
    }
    dev: {
        #Dir
        type!: #AppType
    }
}

migrations: {
    #Dir
    type!: #AppType
    dumps: {
        env_var!: #EnvVars
    }
    "go-migrate": #App
    testseed: {
        env_var!: #EnvVars
    }
}

#Os: "osx"

#Dir

scripts!: {
    env_var!: #EnvVars
}

services: {
    #Dir
    graphql!: #App
    "request-create": #App
    "request-approve": #App
    rule: #App
    "request-by-id": #App
    "requests-by-account": #App
    "transaction-by-id": #App
    "transactions-by-account": #App
    "balance-by-account": #App
    event: #App
    measure: #App
    "auto-confirm": #App
}

tests: {
    #Dir
    runtime!: #Runtime
    type!: #AppType
    deploy: false
}

#Os: "osx"

#Tool: {
    name!: string
    os: [#Os]: {
        install: string
    }
}

".tools": [...#Tool]