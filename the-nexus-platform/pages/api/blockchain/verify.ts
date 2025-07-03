import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Smart contract ABI (simplified for demo)
const CONTRACT_ABI = [
  "function verifyAchievement(string memory achievement, string memory metadata) public returns (bytes32)",
  "function getVerification(bytes32 hash) public view returns (bool, uint256, address)",
  "function getTotalVerifications() public view returns (uint256)"
]

const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-rpc.com'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { achievement, metadata, signature } = req.body

      // Validate signature
      if (!validateSignature(achievement, metadata, signature)) {
        return res.status(401).json({ error: 'Invalid signature' })
      }

      // Connect to blockchain
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
      const wallet = new ethers.Wallet(PRIVATE_KEY!, provider)
      const contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, wallet)

      // Create verification on blockchain
      const tx = await contract.verifyAchievement(
        achievement,
        JSON.stringify(metadata)
      )

      const receipt = await tx.wait()
      const verificationHash = receipt.events[0].args[0]

      // Store in IPFS (simplified)
      const ipfsHash = await storeInIPFS({
        achievement,
        metadata,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString()
      })

      res.status(200).json({
        success: true,
        verificationHash,
        transactionHash: receipt.transactionHash,
        ipfsHash,
        blockNumber: receipt.blockNumber
      })
    } catch (error) {
      console.error('Blockchain verification error:', error)
      res.status(500).json({ error: 'Failed to create blockchain verification' })
    }
  } else if (req.method === 'GET') {
    try {
      const { hash } = req.query

      if (!hash) {
        return res.status(400).json({ error: 'Hash parameter required' })
      }

      const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
      const contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, provider)

      const verification = await contract.getVerification(hash)
      const [isValid, timestamp, verifier] = verification

      if (!isValid) {
        return res.status(404).json({ error: 'Verification not found' })
      }

      res.status(200).json({
        success: true,
        verification: {
          isValid,
          timestamp: new Date(timestamp.toNumber() * 1000).toISOString(),
          verifier,
          hash
        }
      })
    } catch (error) {
      console.error('Blockchain fetch error:', error)
      res.status(500).json({ error: 'Failed to fetch verification' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

function validateSignature(achievement: string, metadata: any, signature: string): boolean {
  // Implement signature validation logic
  // This would typically involve verifying a cryptographic signature
  return true // Simplified for demo
}

async function storeInIPFS(data: any): Promise<string> {
  // Simplified IPFS storage
  // In production, this would use IPFS client
  return `Qm${Math.random().toString(36).substring(2, 15)}`
}