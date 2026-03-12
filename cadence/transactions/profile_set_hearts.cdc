import "YieldPetsProfile"

/// Sync heart count from frontend decay calculation.
transaction(hearts: UInt8) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.setHearts(hearts: hearts)
    }
}
