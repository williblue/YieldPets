import "YieldPetsProfile"

/// Remove a placed furniture item from the room.
transaction(furnitureId: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.removeFurniture(furnitureId: furnitureId)
    }
}
