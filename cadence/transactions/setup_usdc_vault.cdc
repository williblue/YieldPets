import "EVM"
import "YieldPetsUSDCVault"

/// One-time setup: creates a COA (if needed) and a USDC VaultPosition.
///
/// After running this, the user gets:
///   1. A COA at /storage/evm with an EVM address
///   2. A VaultPosition at /storage/YieldPetsUSDCVault
///   3. A public capability to read position data
///
/// Next step: send stgUSDC to the COA's EVM address, then call deposit.
transaction {

    prepare(signer: auth(SaveValue, BorrowValue, IssueStorageCapabilityController, PublishCapability) &Account) {

        // Step 1: Create COA if it doesn't exist
        if signer.storage.type(at: /storage/evm) == nil {
            let coa <- EVM.createCadenceOwnedAccount()
            signer.storage.save(<-coa, to: /storage/evm)
        }

        // Step 2: Issue EVM.Call capability for the COA
        let evmCap = signer.capabilities.storage.issue<auth(EVM.Call) &EVM.CadenceOwnedAccount>(
            /storage/evm
        )

        // Step 3: Create USDC VaultPosition if it doesn't exist
        if signer.storage.type(at: YieldPetsUSDCVault.VaultStoragePath) == nil {
            let vault <- YieldPetsUSDCVault.createVaultPosition(evmCap: evmCap)
            signer.storage.save(<-vault, to: YieldPetsUSDCVault.VaultStoragePath)

            // Publish public capability for reading position data
            let publicCap = signer.capabilities.storage.issue<&{YieldPetsUSDCVault.VaultPositionPublic}>(
                YieldPetsUSDCVault.VaultStoragePath
            )
            signer.capabilities.publish(publicCap, at: YieldPetsUSDCVault.VaultPublicPath)
        }
    }

    execute {
        log("USDC VaultPosition setup complete")
    }
}
