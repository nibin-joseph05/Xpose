package handlers

import (
    "encoding/json"
    "net/http"
    "log"
    "xposechain/blockchain"
)

func MakeAddBlockHandler(bc *blockchain.Blockchain) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }

        var req blockchain.ReportData
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request", http.StatusBadRequest)
            return
        }

        log.Printf("Received new report from Spring Boot: %+v\n", req)
        log.Println("Processing report and adding to blockchain...")

        bc.AddBlock(req)
        newBlock := bc.Blocks[len(bc.Blocks)-1]

        log.Println("Report successfully added to blockchain")

        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]interface{}{
            "success":   true,
            "message":   "Report successfully added to blockchain",
            "hash":      newBlock.Hash,
            "timestamp": newBlock.Timestamp,
        })
    }
}


func MakeGetChainHandler(bc *blockchain.Blockchain) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(bc.Blocks)
    }
}

func MakeValidateHandler(bc *blockchain.Blockchain) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]bool{"isValid": bc.IsValid()})
    }
}
