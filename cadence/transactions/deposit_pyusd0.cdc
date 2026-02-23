import "YieldPetsVault"

/// Deposit PYUSD0 into MoreMarkets lending pool via the user's VaultPosition.
///
/// Prerequisites:
///   - User has run setup_vault.cdc
///   - PYUSD0 is already in the COA's EVM address
///
/// The amount uses UFix64 (8 decimal places). For PYUSD0 (6 decimals),
/// pass the human-readable amount, e.g. 100.0 for 100 PYUSD0.
transaction(amount: UFix64) {

    let vault: auth(YieldPetsVault.Manage) &YieldPetsVault.VaultPosition

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(YieldPetsVault.Manage) &YieldPetsVault.VaultPosition>(
            from: YieldPetsVault.VaultStoragePath
        ) ?? panic("VaultPosition not found. Run setup_vault first.")
    }

    execute {
        self.vault.deposit(amount: amount)
        log("Deposited ".concat(amount.toString()).concat(" PYUSD0 to MoreMarkets"))
    }
}
