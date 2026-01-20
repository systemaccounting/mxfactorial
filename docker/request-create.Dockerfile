FROM public.ecr.aws/docker/library/rust:latest AS builder

ARG RUN_TESTS=true

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
    apt install -y musl-tools perl make

RUN if [ "$RUN_TESTS" = "true" ]; then rustup component add rustfmt clippy; fi
RUN if [ "$RUN_TESTS" = "true" ]; then cargo fmt --check; fi
RUN if [ "$RUN_TESTS" = "true" ]; then cargo clippy -- -D warnings; fi
RUN if [ "$RUN_TESTS" = "true" ]; then cargo test; fi

RUN USER=root cargo build \
    --manifest-path=services/request-create/Cargo.toml \
    --target x86_64-unknown-linux-musl \
    --release

FROM public.ecr.aws/docker/library/alpine:latest

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/request-create /app/request-create

EXPOSE 10002

CMD [ "/app/request-create" ]