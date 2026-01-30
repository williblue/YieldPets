import NonFungibleToken from "./core/NonFungibleToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"

/// YieldGotchi - NFT Vault Guardian that evolves based on DeFi activity
///
/// Each Guardian NFT has:
/// - Evolution stages (egg -> baby -> teen -> adult -> legendary -> dead)
/// - Mood system (0-100)
/// - Growth score based on vault principal and time locked
/// - Equipped armor pieces
access(all) contract YieldGotchi: NonFungibleToken {

    // ========================================
    // Events
    // ========================================

    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event GuardianMinted(id: UInt64, name: String, owner: Address)
    access(all) event GuardianEvolved(id: UInt64, oldStage: String, newStage: String)
    access(all) event MoodUpdated(id: UInt64, oldMood: UFix64, newMood: UFix64)
    access(all) event ArmorEquipped(guardianId: UInt64, armorId: UInt64, slot: String)
    access(all) event ArmorUnequipped(guardianId: UInt64, armorId: UInt64, slot: String)

    // ========================================
    // Paths
    // ========================================

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath

    // ========================================
    // Contract State
    // ========================================

    access(all) var totalSupply: UInt64

    // ========================================
    // Enums
    // ========================================

    access(all) enum Stage: UInt8 {
        access(all) case egg
        access(all) case baby
        access(all) case teen
        access(all) case adult
        access(all) case legendary
        access(all) case dead
    }

    // ========================================
    // Stage Thresholds
    // ========================================

    access(all) fun getStageThreshold(stage: Stage): UFix64 {
        switch stage {
            case Stage.egg:
                return 0.0
            case Stage.baby:
                return 5.0
            case Stage.teen:
                return 20.0
            case Stage.adult:
                return 50.0
            case Stage.legendary:
                return 100.0
            case Stage.dead:
                return 0.0
        }
        return 0.0
    }

    access(all) fun calculateStage(growthScore: UFix64, principal: UFix64): Stage {
        // Dead if principal is 0 after having been alive
        if principal == 0.0 {
            return Stage.dead
        }

        // Stage based on growth score
        if growthScore >= 100.0 {
            return Stage.legendary
        } else if growthScore >= 50.0 {
            return Stage.adult
        } else if growthScore >= 20.0 {
            return Stage.teen
        } else if growthScore >= 5.0 {
            return Stage.baby
        } else {
            return Stage.egg
        }
    }

    // ========================================
    // NFT Resource
    // ========================================

    access(all) resource NFT: NonFungibleToken.NFT {
        access(all) let id: UInt64
        access(all) var name: String
        access(all) var stage: Stage
        access(all) var mood: UFix64 // 0.0 - 100.0
        access(all) let createdAt: UFix64
        access(all) var lastFedAt: UFix64
        access(all) var growthScore: UFix64

        // Equipped armor (slot -> armorId)
        access(all) var equippedArmor: {String: UInt64}

        init(
            id: UInt64,
            name: String
        ) {
            self.id = id
            self.name = name
            self.stage = Stage.egg
            self.mood = 50.0
            self.createdAt = getCurrentBlock().timestamp
            self.lastFedAt = getCurrentBlock().timestamp
            self.growthScore = 0.0
            self.equippedArmor = {}
        }

        access(all) fun updateMood(newMood: UFix64) {
            pre {
                newMood >= 0.0 && newMood <= 100.0: "Mood must be between 0 and 100"
            }
            let oldMood = self.mood
            self.mood = newMood
            emit MoodUpdated(id: self.id, oldMood: oldMood, newMood: newMood)
        }

        access(all) fun updateGrowthScore(principal: UFix64, daysLocked: UFix64) {
            // Formula: log10(1 + principal) * timeLockedDays
            // Simplified approximation for Cadence
            let logBase = 1.0 + principal
            let approximateLog = self.approximateLog10(logBase)
            self.growthScore = approximateLog * daysLocked

            // Update stage based on new growth score
            let newStage = YieldGotchi.calculateStage(growthScore: self.growthScore, principal: principal)
            if newStage != self.stage {
                let oldStage = self.stage
                self.stage = newStage
                emit GuardianEvolved(id: self.id, oldStage: oldStage.rawValue.toString(), newStage: newStage.rawValue.toString())
            }
        }

        // Simple log10 approximation using Taylor series
        access(self) fun approximateLog10(_ x: UFix64): UFix64 {
            if x <= 1.0 {
                return 0.0
            }
            // Simple approximation: log10(x) ≈ (x - 1) / (x + 1) * 2 / ln(10)
            // This is rough but works for game mechanics
            let numerator = x - 1.0
            let denominator = x + 1.0
            return (numerator / denominator) * 0.868589 // 2 / ln(10)
        }

        access(all) fun equipArmor(armorId: UInt64, slot: String) {
            self.equippedArmor[slot] = armorId
            emit ArmorEquipped(guardianId: self.id, armorId: armorId, slot: slot)
        }

        access(all) fun unequipArmor(slot: String) {
            if let armorId = self.equippedArmor[slot] {
                self.equippedArmor.remove(key: slot)
                emit ArmorUnequipped(guardianId: self.id, armorId: armorId, slot: slot)
            }
        }

        access(all) fun feed() {
            self.lastFedAt = getCurrentBlock().timestamp
        }

        // MetadataViews implementation
        access(all) view fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>()
            ]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: "YieldGotchi Guardian - ".concat(self.stage.rawValue.toString()),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://yieldgotchi.io/metadata/".concat(self.id.toString())
                        )
                    )
            }
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-YieldGotchi.createEmptyCollection(nftType: Type<@YieldGotchi.NFT>())
        }
    }

    // ========================================
    // Collection Resource
    // ========================================

    access(all) resource Collection: NonFungibleToken.Collection {
        access(all) var ownedNFTs: @{UInt64: {NonFungibleToken.NFT}}

        init() {
            self.ownedNFTs <- {}
        }

        access(all) view fun getLength(): Int {
            return self.ownedNFTs.length
        }

        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            return &self.ownedNFTs[id]
        }

        access(all) fun borrowYieldGotchi(id: UInt64): &YieldGotchi.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as &{NonFungibleToken.NFT}?
                return ref as! &YieldGotchi.NFT
            }
            return nil
        }

        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("Cannot withdraw: Guardian does not exist in collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let token <- token as! @YieldGotchi.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            return {Type<@YieldGotchi.NFT>(): true}
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@YieldGotchi.NFT>()
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-YieldGotchi.createEmptyCollection(nftType: Type<@YieldGotchi.NFT>())
        }
    }

    // ========================================
    // Minter Resource
    // ========================================

    access(all) resource NFTMinter {
        access(all) fun mintNFT(recipient: &{NonFungibleToken.CollectionPublic}, name: String) {
            let newNFT <- create NFT(
                id: YieldGotchi.totalSupply,
                name: name
            )

            let guardianId = newNFT.id
            emit GuardianMinted(id: guardianId, name: name, owner: recipient.owner!.address)

            recipient.deposit(token: <-newNFT)
            YieldGotchi.totalSupply = YieldGotchi.totalSupply + 1
        }
    }

    // ========================================
    // Public Functions
    // ========================================

    access(all) fun createEmptyCollection(nftType: Type): @{NonFungibleToken.Collection} {
        return <- create Collection()
    }

    // ========================================
    // Contract Init
    // ========================================

    init() {
        self.totalSupply = 0

        self.CollectionStoragePath = /storage/YieldGotchiCollection
        self.CollectionPublicPath = /public/YieldGotchiCollection
        self.MinterStoragePath = /storage/YieldGotchiMinter

        // Create and save minter resource
        self.account.storage.save(<-create NFTMinter(), to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
