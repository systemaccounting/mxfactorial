FROM rust:latest AS builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
	apt install -y musl-tools perl make

RUN USER=root cargo build \
	--manifest-path=services/measure/Cargo.toml \
	--target x86_64-unknown-linux-musl \
	--release

FROM alpine:latest

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/measure /app/measure

CMD [ "/app/measure" ]