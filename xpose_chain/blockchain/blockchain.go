package blockchain

// Blockchain struct contains a slice of Blocks
type Blockchain struct {
	Blocks []Block
}

// NewBlockchain creates a new blockchain with the genesis block
func NewBlockchain() *Blockchain {
	genesis := CreateBlock(0, "Genesis Block", "")
	return &Blockchain{
		Blocks: []Block{genesis},
	}
}

// AddBlock adds a new block to the chain
func (bc *Blockchain) AddBlock(data string) {
	prevBlock := bc.Blocks[len(bc.Blocks)-1]
	newBlock := CreateBlock(prevBlock.Index+1, data, prevBlock.Hash)
	bc.Blocks = append(bc.Blocks, newBlock)
}

// IsValid checks if the blockchain is valid
func (bc *Blockchain) IsValid() bool {
	for i := 1; i < len(bc.Blocks); i++ {
		prev := bc.Blocks[i-1]
		curr := bc.Blocks[i]

		// Check hash consistency
		if curr.PreviousHash != prev.Hash {
			return false
		}

		// Recalculate the hash to check tampering
		if curr.CalculateHash() != curr.Hash {
			return false
		}
	}
	return true
}
