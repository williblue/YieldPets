import "YieldPetsUSDCVault"

/// Withdraw stgUSDC from MoreMarkets lending pool.
/// Tokens are returned to the COA's EVM address.
///
/// Pass amount = 0.0 to withdraw ALL (principal + accrued yield).
transaction(amount: UFix64) {

    let vault: auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition>(
            from: YieldPetsUSDCVault.VaultStoragePath
        ) ?? panic("USDC VaultPosition not found.")
    }

    execute {
        if amount == 0.0 {
            self.vault.withdrawAll()
            log("Withdrew all stgUSDC from MoreMarkets")
        } else {
            self.vault.withdraw(amount: amount)
            log("Withdrew ".concat(amount.toString()).concat(" stgUSDC from MoreMarkets"))
        }
    }
}
