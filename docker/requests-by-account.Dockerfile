FROM rust:latest AS builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
    apt install -y musl-tools perl make

RUN USER=root cargo build \
    --manifest-path=services/requests-by-account/Cargo.toml \
    --target x86_64-unknown-linux-musl \
    --release

FROM alpine

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/requests-by-account /app/requests-by-account

EXPOSE 10006

CMD [ "/app/requests-by-account" ]