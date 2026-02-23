import "YieldPetsVault"

/// Withdraw PYUSD0 from MoreMarkets lending pool.
/// Tokens are returned to the COA's EVM address.
///
/// Pass amount = 0.0 to withdraw ALL (principal + accrued yield).
transaction(amount: UFix64) {

    let vault: auth(YieldPetsVault.Manage) &YieldPetsVault.VaultPosition

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(YieldPetsVault.Manage) &YieldPetsVault.VaultPosition>(
            from: YieldPetsVault.VaultStoragePath
        ) ?? panic("VaultPosition not found.")
    }

    execute {
        if amount == 0.0 {
            self.vault.withdrawAll()
            log("Withdrew all PYUSD0 from MoreMarkets")
        } else {
            self.vault.withdraw(amount: amount)
            log("Withdrew ".concat(amount.toString()).concat(" PYUSD0 from MoreMarkets"))
        }
    }
}
