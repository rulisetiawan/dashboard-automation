FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/scada-ingest cmd/worker/main.go

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/scada-ingest /app/scada-ingest

ENV TZ=Asia/Jakarta

ENTRYPOINT ["/app/scada-ingest"]
