FROM rust:latest as builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
    apt install -y musl-tools perl make

RUN USER=root cargo build \
    --manifest-path=services/auto-confirm/Cargo.toml \
    --target x86_64-unknown-linux-musl \
    --release

FROM public.ecr.aws/lambda/provided:al2023

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/auto-confirm ./auto-confirm

ENTRYPOINT [ "./auto-confirm" ]