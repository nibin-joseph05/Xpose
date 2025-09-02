// block/block.go

package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"time"
)

type Block struct {
	Index        int
	Timestamp    string
	Data         string
	PreviousHash string
	Hash         string
}

func (b *Block) CalculateHash() string {
	record := string(b.Index) + b.Timestamp + b.Data + b.PreviousHash
	hash := sha256.New()
	hash.Write([]byte(record))
	hashed := hash.Sum(nil)
	return hex.EncodeToString(hashed)
}

func CreateBlock(index int, data string, prevHash string) Block {
	block := Block{
		Index:        index,
		Timestamp:    time.Now().String(),
		Data:         data,
		PreviousHash: prevHash,
	}
	block.Hash = block.CalculateHash()
	return block
}
