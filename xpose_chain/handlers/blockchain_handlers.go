package handlers

import (
    "encoding/json"
    "net/http"
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

        bc.AddBlock(req)
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]string{"status": "Block added"})
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
