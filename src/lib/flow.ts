import * as fcl from "@onflow/fcl";

fcl.config()
  .put("accessNode.api", process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-mainnet.onflow.org")
  .put("flow.network", process.env.NEXT_PUBLIC_FLOW_NETWORK || "mainnet")
  .put("0xFungibleToken", "0xf233dcee88fe0abe")
  .put("0xFlowToken", "0x1654653399040a61");

export const TRANSFER_FLOW = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

transaction(amount: UFix64, to: Address) {
    let sentVault: @{FungibleToken.Vault}

    prepare(signer: auth(BorrowValue) &Account) {
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let receiverRef = getAccount(to)
            .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")
        receiverRef.deposit(from: <-self.sentVault)
    }
}
`;
