package blockchain

import (
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "time"
)

type Block struct {
    Index        int        `json:"index"`
    Timestamp    string     `json:"timestamp"`
    Data         ReportData `json:"data"`
    PreviousHash string     `json:"previousHash"`
    Hash         string     `json:"hash"`
}

func (b *Block) CalculateHash() string {
    dataBytes, _ := json.Marshal(b.Data)
    record := string(b.Index) + b.Timestamp + string(dataBytes) + b.PreviousHash
    hash := sha256.Sum256([]byte(record))
    return hex.EncodeToString(hash[:])
}

func CreateBlock(index int, data ReportData, prevHash string) Block {
    block := Block{
        Index:        index,
        Timestamp:    time.Now().UTC().Format(time.RFC3339),
        Data:         data,
        PreviousHash: prevHash,
    }
    block.Hash = block.CalculateHash()
    return block
}

