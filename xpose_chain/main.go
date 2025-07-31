package main

import (
	"fmt"
	"xposechain/blockchain"
)

func main() {
	bc := blockchain.NewBlockchain()

	bc.AddBlock("Report: Drug activity near school.")
	bc.AddBlock("Report: Suspicious package found.")

	for _, blk := range bc.Blocks {
		fmt.Printf("Block #%d:\n", blk.Index)
		fmt.Printf("Data: %s\n", blk.Data)
		fmt.Printf("Hash: %s\n", blk.Hash)
		fmt.Printf("Previous Hash: %s\n\n", blk.PreviousHash)
	}

	fmt.Println("Is Blockchain Valid?", bc.IsValid())
}
