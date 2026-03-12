import "YieldPetsProfile"

/// Buy a food item from the shop (deducts nuggets, adds to inventory).
transaction(foodId: String, price: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.buyFood(foodId: foodId, price: price)
    }
}
