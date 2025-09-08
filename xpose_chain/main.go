package main

import (
    "fmt"
    "log"
    "net/http"
    "os"

    "github.com/joho/godotenv"
    "xposechain/blockchain"
    "xposechain/routes"
)

func main() {
    _ = godotenv.Load(".env")

    address := os.Getenv("BLOCKCHAIN_SERVER_ADDRESS")
    if address == "" {
        address = "127.0.0.1"
    }

    port := os.Getenv("BLOCKCHAIN_SERVER_PORT")
    if port == "" {
        port = "9000"
    }

    bc := blockchain.NewBlockchain()
    mux := http.NewServeMux()
    routes.RegisterBlockchainRoutes(mux, bc)

    serverAddr := fmt.Sprintf("%s:%s", address, port)
    log.Printf("Blockchain server running at http://%s\n", serverAddr)
    log.Fatal(http.ListenAndServe(serverAddr, mux))
}
