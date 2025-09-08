package blockchain

import (
    "time"
)

type Blockchain struct {
    Blocks []Block
}

func NewBlockchain() *Blockchain {
    genesisReport := ReportData{
        ReportID:    "GENESIS",
        CategoryID:  0,
        Description: "Genesis Block",
        SubmittedAt: time.Now().UTC().Format(time.RFC3339),
    }
    genesis := CreateBlock(0, genesisReport, "")
    return &Blockchain{
        Blocks: []Block{genesis},
    }
}

func (bc *Blockchain) AddBlock(data ReportData) {
    prevBlock := bc.Blocks[len(bc.Blocks)-1]
    newBlock := CreateBlock(prevBlock.Index+1, data, prevBlock.Hash)
    bc.Blocks = append(bc.Blocks, newBlock)
}

func (bc *Blockchain) IsValid() bool {
    for i := 1; i < len(bc.Blocks); i++ {
        prev := bc.Blocks[i-1]
        curr := bc.Blocks[i]

        if curr.PreviousHash != prev.Hash {
            return false
        }

        if curr.CalculateHash() != curr.Hash {
            return false
        }
    }
    return true
}
