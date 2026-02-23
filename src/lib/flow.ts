import * as fcl from "@onflow/fcl";

fcl.config()
  .put("accessNode.api", process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-mainnet.onflow.org")
  .put("flow.network", process.env.NEXT_PUBLIC_FLOW_NETWORK || "mainnet")
  .put("0xFungibleToken", "0xf233dcee88fe0abe")
  .put("0xFlowToken", "0x1654653399040a61");

export const GET_COA_ADDRESS = `
import EVM from 0xe467b9dd11fa00df

access(all) fun main(address: Address): String? {
    let acct = getAccount(address)
    let cap = acct.capabilities.borrow<&EVM.CadenceOwnedAccount>(/public/evm)
    if cap == nil {
        return nil
    }
    let evmAddr = cap!.address()
    let bytes = evmAddr.bytes
    let table: [String] = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
    var result = "0x"
    for byte in bytes {
        result = result.concat(table[Int(byte / 16)]).concat(table[Int(byte % 16)])
    }
    return result
}
`;

export const CREATE_COA = `
import EVM from 0xe467b9dd11fa00df

transaction {
    prepare(signer: auth(SaveValue, BorrowValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        if signer.storage.type(at: /storage/evm) == nil {
            let coa <- EVM.createCadenceOwnedAccount()
            signer.storage.save(<-coa, to: /storage/evm)
        }

        if !signer.capabilities.get<&EVM.CadenceOwnedAccount>(/public/evm).check() {
            let cap = signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(/storage/evm)
            signer.capabilities.publish(cap, at: /public/evm)
        }
    }

    execute {
        log("COA setup complete")
    }
}
`;

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
