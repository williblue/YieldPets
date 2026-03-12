import "YieldPetsProfile"

/// Read the full game state for an account.
access(all) fun main(address: Address): {String: AnyStruct}? {
    let account = getAccount(address)
    let cap = account.capabilities.get<&{YieldPetsProfile.ProfilePublic}>(
        YieldPetsProfile.ProfilePublicPath
    )
    if let profile = cap.borrow() {
        return profile.getFullState()
    }
    return nil
}
