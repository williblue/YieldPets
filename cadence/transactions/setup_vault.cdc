import "EVM"
import "YieldPetsVault"

/// One-time setup: creates a COA (if needed) and a VaultPosition.
///
/// After running this, the user gets:
///   1. A COA at /storage/evm with an EVM address
///   2. A VaultPosition at /storage/YieldPetsVault
///   3. A public capability to read position data
///
/// Next step: send PYUSD0 to the COA's EVM address, then call deposit.
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

        // Step 3: Create VaultPosition if it doesn't exist
        if signer.storage.type(at: YieldPetsVault.VaultStoragePath) == nil {
            let vault <- YieldPetsVault.createVaultPosition(evmCap: evmCap)
            signer.storage.save(<-vault, to: YieldPetsVault.VaultStoragePath)

            // Publish public capability for reading position data
            let publicCap = signer.capabilities.storage.issue<&{YieldPetsVault.VaultPositionPublic}>(
                YieldPetsVault.VaultStoragePath
            )
            signer.capabilities.publish(publicCap, at: YieldPetsVault.VaultPublicPath)
        }
    }

    execute {
        log("VaultPosition setup complete")
    }
}
