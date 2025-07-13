# Gunakan image official Go
FROM golang:1.21

# Buat folder kerja di dalam container
WORKDIR /app

# Copy semua file
COPY . .

# Download dependency
RUN go mod tidy

# Build binary-nya
RUN go build -o main .

# Jalankan aplikasinya
CMD ["./main"]
