FROM mxfactorial/rule-base:v1 as builder

WORKDIR /app

COPY Cargo.lock ./

COPY crates crates/

COPY services/rule services/rule/

RUN touch services/rule/src/main.rs

RUN USER=root cargo build \
	--manifest-path=services/rule/Cargo.toml \
	--target x86_64-unknown-linux-musl

FROM rust:alpine3.17

COPY --from=builder /app/target/x86_64-unknown-linux-musl/debug/rule /usr/local/bin

EXPOSE 8080

CMD [ "/usr/local/bin/rule" ]