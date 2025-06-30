# 1. Gunakan image Golang
FROM golang:1.21

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy semua file project ke dalam container
COPY . .

# 4. Download dependency Go
RUN go mod tidy

# 5. Build binary
RUN go build -o app .

# 6. Jalankan binary saat container aktif
CMD ["./app"]

COPY .env .