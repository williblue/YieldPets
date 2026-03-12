import "YieldPetsProfile"

/// Place an owned furniture item in the room.
transaction(furnitureId: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.placeFurniture(furnitureId: furnitureId)
    }
}
