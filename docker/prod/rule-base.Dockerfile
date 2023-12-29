FROM rust:1.75-slim

WORKDIR /app

COPY . .

RUN rustup target add x86_64-unknown-linux-musl

RUN USER=root cargo build \
	--manifest-path=services/rule/Cargo.toml \
	--target x86_64-unknown-linux-musl