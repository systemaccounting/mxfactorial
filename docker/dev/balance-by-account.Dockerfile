FROM rust:latest as builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
	apt install -y musl-tools perl make
RUN update-ca-certificates

ENV USER=balance-by-account
ENV UID=10004

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN USER=root cargo build \
		--manifest-path=services/balance-by-account/Cargo.toml \
		--target x86_64-unknown-linux-musl \
		--release

FROM alpine

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/balance-by-account /usr/local/bin

EXPOSE 10004

USER balance-by-account:balance-by-account

CMD [ "/usr/local/bin/balance-by-account" ]