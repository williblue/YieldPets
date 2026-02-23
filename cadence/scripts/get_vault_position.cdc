import "YieldPetsVault"

/// Query a user's vault position data.
/// Returns deposit info, growth score, live aToken balance, and COA EVM address.
access(all) fun main(account: Address): {String: AnyStruct} {
    let acct = getAccount(account)

    let vault = acct.capabilities.borrow<&{YieldPetsVault.VaultPositionPublic}>(
        YieldPetsVault.VaultPublicPath
    ) ?? panic("No VaultPosition found for this account. Run setup_vault first.")

    // Cadence-tracked data (view, no EVM calls)
    let totalDeposited = vault.getTotalDeposited()
    let firstDeposit = vault.getFirstDepositTimestamp()
    let lastDeposit = vault.getLastDepositTimestamp()
    let depositCount = vault.getDepositCount()
    let growthScore = vault.getGrowthScore()

    // Live EVM queries
    let aTokenBalance = vault.queryATokenBalance() // raw uint256 (6 decimals)
    let evmAddress = vault.getEVMAddressHex()

    return {
        "totalDeposited": totalDeposited,
        "firstDepositTimestamp": firstDeposit,
        "lastDepositTimestamp": lastDeposit,
        "depositCount": depositCount,
        "growthScore": growthScore,
        "aTokenBalance": aTokenBalance,
        "evmAddress": evmAddress
    }
}
