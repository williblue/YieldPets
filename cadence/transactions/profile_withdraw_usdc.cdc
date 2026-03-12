import "YieldPetsProfile"

/// Record a stgUSDC withdrawal on-chain.
transaction(amount: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.withdrawUsdc(amount: amount)
    }
}
