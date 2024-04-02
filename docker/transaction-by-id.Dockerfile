FROM rust:latest as builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
	apt install -y musl-tools perl make
RUN update-ca-certificates

ENV USER=transaction-by-id
ENV UID=10007

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN USER=root cargo build \
		--manifest-path=services/transaction-by-id/Cargo.toml \
		--target x86_64-unknown-linux-musl \
		--release

FROM alpine

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/transaction-by-id /usr/local/bin

EXPOSE 10007

USER transaction-by-id:transaction-by-id

CMD [ "/usr/local/bin/transaction-by-id" ]