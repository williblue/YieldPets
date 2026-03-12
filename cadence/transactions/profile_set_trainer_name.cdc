import "YieldPetsProfile"

/// Update the trainer's name.
transaction(name: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.setTrainerName(name: name)
    }
}
