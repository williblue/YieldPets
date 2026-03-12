import "YieldPetsProfile"

/// Feed the pet. Pass foodId (or empty string for free feed) and heartRestore amount.
transaction(foodId: String, heartRestore: UInt8) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        let food: String? = foodId.length > 0 ? foodId : nil
        profile.feed(foodId: food, heartRestore: heartRestore)
    }
}
