import NonFungibleToken from "./core/NonFungibleToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"

/// YieldPets - NFT Vault Guardian that evolves based on DeFi activity
///
/// Each Guardian NFT has:
/// - Evolution stages (egg -> baby -> teen -> adult -> legendary -> dead)
/// - Mood system (0-100)
/// - Growth score based on vault principal and time locked
/// - Equipped armor pieces
access(all) contract YieldPets: NonFungibleToken {

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
    access(all) event HeartsUpdated(id: UInt64, oldHearts: UInt8, newHearts: UInt8)
    access(all) event NuggetsUpdated(id: UInt64, nuggets: UInt64)
    access(all) event GameStateSaved(id: UInt64, hearts: UInt8, nuggets: UInt64, streak: UInt64)

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
    // Game State Struct (for bulk read)
    // ========================================

    access(all) struct GameStateSnapshot {
        access(all) let hearts: UInt8
        access(all) let nuggets: UInt64
        access(all) let totalYieldEarned: UFix64
        access(all) let lastFedAt: UFix64
        access(all) let currentStreak: UInt64
        access(all) let longestStreak: UInt64
        access(all) let lastLoginDate: String
        access(all) let dailyBonusClaimed: Bool
        access(all) let foodInventory: {String: UInt64}
        access(all) let ownedFurniture: [String]
        access(all) let placedFurniture: [String]
        access(all) let petName: String
        access(all) let trainerName: String
        access(all) let stage: UInt8
        access(all) let growthScore: UFix64

        init(
            hearts: UInt8,
            nuggets: UInt64,
            totalYieldEarned: UFix64,
            lastFedAt: UFix64,
            currentStreak: UInt64,
            longestStreak: UInt64,
            lastLoginDate: String,
            dailyBonusClaimed: Bool,
            foodInventory: {String: UInt64},
            ownedFurniture: [String],
            placedFurniture: [String],
            petName: String,
            trainerName: String,
            stage: UInt8,
            growthScore: UFix64
        ) {
            self.hearts = hearts
            self.nuggets = nuggets
            self.totalYieldEarned = totalYieldEarned
            self.lastFedAt = lastFedAt
            self.currentStreak = currentStreak
            self.longestStreak = longestStreak
            self.lastLoginDate = lastLoginDate
            self.dailyBonusClaimed = dailyBonusClaimed
            self.foodInventory = foodInventory
            self.ownedFurniture = ownedFurniture
            self.placedFurniture = placedFurniture
            self.petName = petName
            self.trainerName = trainerName
            self.stage = stage
            self.growthScore = growthScore
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

        // ── Game state fields (synced from client) ──
        access(all) var hearts: UInt8           // 0-4
        access(all) var nuggets: UInt64         // gold nugget balance
        access(all) var totalYieldEarned: UFix64
        access(all) var currentStreak: UInt64
        access(all) var longestStreak: UInt64
        access(all) var lastLoginDate: String
        access(all) var dailyBonusClaimed: Bool
        access(all) var foodInventory: {String: UInt64}
        access(all) var ownedFurniture: [String]
        access(all) var placedFurniture: [String]
        access(all) var trainerName: String

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

            // Game state defaults (match GameProvider INITIAL_STATE)
            self.hearts = 0
            self.nuggets = 0
            self.totalYieldEarned = 0.0
            self.currentStreak = 1
            self.longestStreak = 1
            self.lastLoginDate = ""
            self.dailyBonusClaimed = false
            self.foodInventory = {}
            self.ownedFurniture = []
            self.placedFurniture = []
            self.trainerName = "Trainer"
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
            let newStage = YieldPets.calculateStage(growthScore: self.growthScore, principal: principal)
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

        // ── Bulk save: persist full game state from client ──
        access(all) fun saveGameState(
            hearts: UInt8,
            nuggets: UInt64,
            totalYieldEarned: UFix64,
            lastFedAt: UFix64,
            currentStreak: UInt64,
            longestStreak: UInt64,
            lastLoginDate: String,
            dailyBonusClaimed: Bool,
            foodInventory: {String: UInt64},
            ownedFurniture: [String],
            placedFurniture: [String],
            petName: String,
            trainerName: String
        ) {
            pre {
                hearts <= 4: "Hearts must be 0-4"
            }

            let oldHearts = self.hearts

            self.hearts = hearts
            self.nuggets = nuggets
            self.totalYieldEarned = totalYieldEarned
            self.lastFedAt = lastFedAt
            self.currentStreak = currentStreak
            self.longestStreak = longestStreak
            self.lastLoginDate = lastLoginDate
            self.dailyBonusClaimed = dailyBonusClaimed
            self.foodInventory = foodInventory
            self.ownedFurniture = ownedFurniture
            self.placedFurniture = placedFurniture
            self.name = petName
            self.trainerName = trainerName

            // Map hearts to mood (0→0, 1→25, 2→50, 3→75, 4→100)
            self.mood = UFix64(hearts) * 25.0

            if oldHearts != hearts {
                emit HeartsUpdated(id: self.id, oldHearts: oldHearts, newHearts: hearts)
            }

            emit GameStateSaved(
                id: self.id,
                hearts: hearts,
                nuggets: nuggets,
                streak: currentStreak
            )
        }

        // ── Read full game state as a struct ──
        access(all) fun loadGameState(): YieldPets.GameStateSnapshot {
            return GameStateSnapshot(
                hearts: self.hearts,
                nuggets: self.nuggets,
                totalYieldEarned: self.totalYieldEarned,
                lastFedAt: self.lastFedAt,
                currentStreak: self.currentStreak,
                longestStreak: self.longestStreak,
                lastLoginDate: self.lastLoginDate,
                dailyBonusClaimed: self.dailyBonusClaimed,
                foodInventory: self.foodInventory,
                ownedFurniture: self.ownedFurniture,
                placedFurniture: self.placedFurniture,
                petName: self.name,
                trainerName: self.trainerName,
                stage: self.stage.rawValue,
                growthScore: self.growthScore
            )
        }

        // ── Individual updaters for targeted saves ──
        access(all) fun updateHearts(newHearts: UInt8) {
            pre {
                newHearts <= 4: "Hearts must be 0-4"
            }
            let old = self.hearts
            self.hearts = newHearts
            self.mood = UFix64(newHearts) * 25.0
            emit HeartsUpdated(id: self.id, oldHearts: old, newHearts: newHearts)
        }

        access(all) fun addNuggets(amount: UInt64) {
            self.nuggets = self.nuggets + amount
            emit NuggetsUpdated(id: self.id, nuggets: self.nuggets)
        }

        access(all) fun spendNuggets(amount: UInt64) {
            pre {
                amount <= self.nuggets: "Insufficient nuggets"
            }
            self.nuggets = self.nuggets - amount
            emit NuggetsUpdated(id: self.id, nuggets: self.nuggets)
        }

        access(all) fun updateStreak(
            current: UInt64,
            longest: UInt64,
            lastLogin: String,
            bonusClaimed: Bool
        ) {
            self.currentStreak = current
            self.longestStreak = longest
            self.lastLoginDate = lastLogin
            self.dailyBonusClaimed = bonusClaimed
        }

        access(all) fun updateFoodInventory(inventory: {String: UInt64}) {
            self.foodInventory = inventory
        }

        access(all) fun updateFurniture(owned: [String], placed: [String]) {
            self.ownedFurniture = owned
            self.placedFurniture = placed
        }

        access(all) fun setTrainerName(newName: String) {
            self.trainerName = newName
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
                        description: "YieldPets Guardian - ".concat(self.stage.rawValue.toString()),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://yieldpets.io/metadata/".concat(self.id.toString())
                        )
                    )
            }
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-YieldPets.createEmptyCollection(nftType: Type<@YieldPets.NFT>())
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

        access(all) fun borrowYieldPets(id: UInt64): &YieldPets.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as &{NonFungibleToken.NFT}?
                return ref as! &YieldPets.NFT
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
            let token <- token as! @YieldPets.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            return {Type<@YieldPets.NFT>(): true}
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@YieldPets.NFT>()
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-YieldPets.createEmptyCollection(nftType: Type<@YieldPets.NFT>())
        }
    }

    // ========================================
    // Minter Resource
    // ========================================

    access(all) resource NFTMinter {
        access(all) fun mintNFT(recipient: &{NonFungibleToken.CollectionPublic}, name: String) {
            let newNFT <- create NFT(
                id: YieldPets.totalSupply,
                name: name
            )

            let guardianId = newNFT.id
            emit GuardianMinted(id: guardianId, name: name, owner: recipient.owner!.address)

            recipient.deposit(token: <-newNFT)
            YieldPets.totalSupply = YieldPets.totalSupply + 1
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

        self.CollectionStoragePath = /storage/YieldPetsCollection
        self.CollectionPublicPath = /public/YieldPetsCollection
        self.MinterStoragePath = /storage/YieldPetsMinter

        // Create and save minter resource
        self.account.storage.save(<-create NFTMinter(), to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
