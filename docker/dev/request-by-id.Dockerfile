FROM rust:latest as builder

WORKDIR /app

COPY . ./

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && \
	apt install -y musl-tools perl make
RUN update-ca-certificates

ENV USER=request-by-id
ENV UID=10005

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN USER=root cargo build \
		--manifest-path=services/request-by-id/Cargo.toml \
		--target x86_64-unknown-linux-musl \
		--release

FROM alpine

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/request-by-id /usr/local/bin

EXPOSE 10005

USER request-by-id:request-by-id

CMD [ "/usr/local/bin/request-by-id" ]