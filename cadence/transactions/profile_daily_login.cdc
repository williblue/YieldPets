import "YieldPetsProfile"

/// Claim daily login bonus. Pass today/yesterday as YYYY-MM-DD strings
/// and the computed bonus amount from the frontend.
transaction(today: String, yesterday: String, bonusAmount: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.checkDailyLogin(today: today, yesterday: yesterday, bonusAmount: bonusAmount)
    }
}
