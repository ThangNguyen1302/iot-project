# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install required dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -o main .

# Final stage - minimal runtime image
FROM alpine:3.17

# Install CA certificates for HTTPS requests
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .
# Copy config files
COPY ./fanTrain.txt ./
COPY ./app.* ./  

# Expose the port
EXPOSE 8080

# Command to run the application
CMD ["./main"]