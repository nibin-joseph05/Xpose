package blockchain

import (
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/syndtr/goleveldb/leveldb"
)

type Blockchain struct {
    Blocks []Block
    DB     *leveldb.DB
}

func NewBlockchain(dbPath string) *Blockchain {
    db, err := leveldb.OpenFile(dbPath, nil)
    if err != nil {
        log.Fatalf("Failed to open LevelDB: %v", err)
    }

    bc := &Blockchain{
        Blocks: []Block{},
        DB:     db,
    }

    iter := db.NewIterator(nil, nil)
    for iter.Next() {
        var block Block
        if err := json.Unmarshal(iter.Value(), &block); err != nil {
            log.Println("Failed to unmarshal block:", err)
            continue
        }
        bc.Blocks = append(bc.Blocks, block)
    }
    iter.Release()

    if len(bc.Blocks) == 0 {
        genesisReport := ReportData{
            ReportID:    "GENESIS",
            CategoryID:  0,
            Description: "Genesis Block",
            SubmittedAt: time.Now().UTC().Format(time.RFC3339),
        }
        genesis := CreateBlock(0, genesisReport, "")
        bc.Blocks = append(bc.Blocks, genesis)
        bc.saveBlockToDB(genesis)
    }

    return bc
}

func (bc *Blockchain) saveBlockToDB(block Block) {
    key := []byte(fmt.Sprintf("block-%d", block.Index))
    value, _ := json.Marshal(block)
    if err := bc.DB.Put(key, value, nil); err != nil {
        log.Println("Failed to write block to DB:", err)
    }
}

func (bc *Blockchain) AddBlock(data ReportData) {
    prevBlock := bc.Blocks[len(bc.Blocks)-1]
    newBlock := CreateBlock(prevBlock.Index+1, data, prevBlock.Hash)
    bc.Blocks = append(bc.Blocks, newBlock)
    bc.saveBlockToDB(newBlock)
    fmt.Printf("Added Block %d: %+v\n", newBlock.Index, newBlock)
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
