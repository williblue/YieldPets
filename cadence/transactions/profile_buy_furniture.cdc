import "YieldPetsProfile"

/// Buy a furniture item (deducts nuggets, adds to owned + placed).
transaction(furnitureId: String, price: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.buyFurniture(furnitureId: furnitureId, price: price)
    }
}
