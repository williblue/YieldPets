import "YieldPetsProfile"

/// Sync yield accrual from frontend calculation to on-chain profile.
transaction(pyusdEarned: UFix64, usdcEarned: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.accrueYield(pyusdEarned: pyusdEarned, usdcEarned: usdcEarned)
    }
}
