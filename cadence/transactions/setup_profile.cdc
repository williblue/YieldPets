import "YieldPetsProfile"

/// Create a YieldPetsProfile resource if the account doesn't have one yet.
transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        if signer.storage.borrow<&YieldPetsProfile.Profile>(from: YieldPetsProfile.ProfileStoragePath) != nil {
            return
        }

        let profile <- YieldPetsProfile.createProfile()
        signer.storage.save(<-profile, to: YieldPetsProfile.ProfileStoragePath)

        let cap = signer.capabilities.storage.issue<&{YieldPetsProfile.ProfilePublic}>(
            YieldPetsProfile.ProfileStoragePath
        )
        signer.capabilities.publish(cap, at: YieldPetsProfile.ProfilePublicPath)
    }
}
