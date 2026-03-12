import "YieldPetsUSDCVault"

/// Deposit stgUSDC into MoreMarkets lending pool via the user's USDC VaultPosition.
///
/// Prerequisites:
///   - User has run setup_usdc_vault.cdc
///   - stgUSDC is already in the COA's EVM address
///
/// The amount uses UFix64 (8 decimal places). For stgUSDC (6 decimals),
/// pass the human-readable amount, e.g. 100.0 for 100 stgUSDC.
transaction(amount: UFix64) {

    let vault: auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition>(
            from: YieldPetsUSDCVault.VaultStoragePath
        ) ?? panic("USDC VaultPosition not found. Run setup_usdc_vault first.")
    }

    execute {
        self.vault.deposit(amount: amount)
        log("Deposited ".concat(amount.toString()).concat(" stgUSDC to MoreMarkets"))
    }
}
