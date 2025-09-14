package main

import (
    "net/http"
    "xposechain/blockchain"
    "xposechain/handlers"
)

func RegisterBlockchainRoutes(mux *http.ServeMux, bc *blockchain.Blockchain) {
    mux.HandleFunc("/add", handlers.MakeAddBlockHandler(bc))
    mux.HandleFunc("/chain", handlers.MakeGetChainHandler(bc))
    mux.HandleFunc("/valid", handlers.MakeValidateHandler(bc))
    mux.HandleFunc("/report/", handlers.MakeGetReportHandler(bc))
}