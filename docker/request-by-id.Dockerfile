FROM rust:latest as builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
    apt install -y musl-tools perl make

RUN USER=root cargo build \
    --manifest-path=services/request-by-id/Cargo.toml \
    --target x86_64-unknown-linux-musl \
    --release

FROM alpine

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.2 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/request-by-id /app/request-by-id

EXPOSE 10005

CMD [ "/app/request-by-id" ]