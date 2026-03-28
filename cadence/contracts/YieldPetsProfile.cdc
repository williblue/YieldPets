/// YieldPetsProfile — On-chain game state for YieldPets.
/// Stores pet stats, economy, inventory, streaks, and transaction history.
/// Game logic (heart decay, yield calc, streak formulas) stays in the frontend;
/// this contract is a verifiable state store.
access(all) contract YieldPetsProfile {

    // ========================================
    // Entitlements
    // ========================================

    access(all) entitlement Manage

    // ========================================
    // Paths
    // ========================================

    access(all) let ProfileStoragePath: StoragePath
    access(all) let ProfilePublicPath: PublicPath

    // ========================================
    // Events
    // ========================================

    access(all) event ProfileCreated(account: Address)
    access(all) event PetFed(account: Address, hearts: UInt8, nuggets: UInt64)
    access(all) event FoodPurchased(account: Address, foodId: String, price: UInt64)
    access(all) event FurniturePurchased(account: Address, furnitureId: String, price: UInt64)
    access(all) event Deposited(account: Address, amount: UFix64, isUsdc: Bool)
    access(all) event Withdrawn(account: Address, amount: UFix64, isUsdc: Bool)
    access(all) event DailyBonusClaimed(account: Address, streak: UInt64, bonus: UInt64)

    // ========================================
    // Constants
    // ========================================

    access(all) let FEED_BONUS: UInt64       // nuggets awarded per feed
    access(all) let MAX_HEARTS: UInt8
    access(all) let MAX_TRANSACTIONS: Int

    // ========================================
    // Structs
    // ========================================

    access(all) struct TransactionRecord {
        access(all) let txType: String
        access(all) let label: String
        access(all) let amount: Fix64
        access(all) let timestamp: UFix64

        init(txType: String, label: String, amount: Fix64) {
            self.txType = txType
            self.label = label
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
        }
    }

    // ========================================
    // Public Interface
    // ========================================

    access(all) resource interface ProfilePublic {
        // Pet
        access(all) view fun getPetName(): String
        access(all) view fun getTrainerName(): String
        access(all) view fun getHearts(): UInt8
        access(all) view fun getLastFedAt(): UFix64

        // Economy
        access(all) view fun getNuggets(): UInt64
        access(all) view fun getDepositBalance(): UFix64
        access(all) view fun getUsdcDepositBalance(): UFix64
        access(all) view fun getTotalYieldEarned(): UFix64

        // Streaks
        access(all) view fun getCurrentStreak(): UInt64
        access(all) view fun getLongestStreak(): UInt64
        access(all) view fun getLastLoginDate(): String
        access(all) view fun getDailyBonusClaimed(): Bool

        // Inventory
        access(all) view fun getOwnedFurniture(): [String]
        access(all) view fun getPlacedFurniture(): [String]
        access(all) view fun getFoodInventory(): {String: UInt64}

        // History
        access(all) view fun getTransactions(): [TransactionRecord]

        // Meta
        access(all) view fun getCreatedAt(): UFix64

        // Convenience
        access(all) view fun getFullState(): {String: AnyStruct}
    }

    // ========================================
    // Profile Resource
    // ========================================

    access(all) resource Profile: ProfilePublic {
        // ── Pet ──
        access(self) var petName: String
        access(self) var trainerName: String
        access(self) var hearts: UInt8
        access(self) var lastFedAt: UFix64

        // ── Economy ──
        access(self) var nuggets: UInt64
        access(self) var depositBalance: UFix64
        access(self) var usdcDepositBalance: UFix64
        access(self) var totalYieldEarned: UFix64

        // ── Streaks ──
        access(self) var currentStreak: UInt64
        access(self) var longestStreak: UInt64
        access(self) var lastLoginDate: String
        access(self) var dailyBonusClaimed: Bool

        // ── Inventory ──
        access(self) var ownedFurniture: [String]
        access(self) var placedFurniture: [String]
        access(self) var foodInventory: {String: UInt64}

        // ── History ──
        access(self) var transactions: [TransactionRecord]

        // ── Meta ──
        access(self) let createdAt: UFix64

        init() {
            self.petName = "Sprout"
            self.trainerName = "Trainer"
            self.hearts = 0
            self.lastFedAt = getCurrentBlock().timestamp

            self.nuggets = 0
            self.depositBalance = 0.0
            self.usdcDepositBalance = 0.0
            self.totalYieldEarned = 0.0

            self.currentStreak = 1
            self.longestStreak = 1
            self.lastLoginDate = ""
            self.dailyBonusClaimed = false

            self.ownedFurniture = []
            self.placedFurniture = []
            self.foodInventory = {}

            self.transactions = []

            self.createdAt = getCurrentBlock().timestamp
        }

        // ── Internal helper ──
        access(self) fun pushTx(txType: String, label: String, amount: Fix64) {
            let record = TransactionRecord(txType: txType, label: label, amount: amount)
            self.transactions.insert(at: 0, record)
            // Cap at MAX_TRANSACTIONS
            if self.transactions.length > YieldPetsProfile.MAX_TRANSACTIONS {
                self.transactions.removeLast()
            }
        }

        // ========================================
        // Manage (owner-only) actions
        // ========================================

        /// Feed the pet. If foodId is provided and in inventory, consume it and
        /// restore hearts based on heartRestore param. Otherwise free feed (+1 heart).
        access(Manage) fun feed(foodId: String?, heartRestore: UInt8) {
            if let id = foodId {
                if id != "" {
                    // Consume food from inventory
                    let count = self.foodInventory[id] ?? 0
                    assert(count > 0, message: "Food not in inventory")
                    if count <= 1 {
                        self.foodInventory.remove(key: id)
                    } else {
                        self.foodInventory[id] = count - 1
                    }
                    let restore: UInt8 = heartRestore > 0 ? heartRestore : 1
                    // Cap restore to avoid UInt8 overflow before addition
                    let maxRestore = YieldPetsProfile.MAX_HEARTS - self.hearts
                    let effectiveRestore = restore > maxRestore ? maxRestore : restore
                    self.hearts = self.hearts + effectiveRestore
                } else {
                    // Empty string: treat as free feed
                    if self.hearts < YieldPetsProfile.MAX_HEARTS {
                        self.hearts = self.hearts + 1
                    }
                }
            } else {
                // Free feed: +1 heart
                if self.hearts < YieldPetsProfile.MAX_HEARTS {
                    self.hearts = self.hearts + 1
                }
            }

            // Award feed bonus nuggets
            self.nuggets = self.nuggets + YieldPetsProfile.FEED_BONUS
            self.lastFedAt = getCurrentBlock().timestamp
            self.pushTx(txType: "nuggets_collected", label: "Nuggets collected", amount: Fix64(YieldPetsProfile.FEED_BONUS))

            emit PetFed(account: self.owner!.address, hearts: self.hearts, nuggets: self.nuggets)
        }

        /// Buy a food item (deduct nuggets, add to inventory)
        access(Manage) fun buyFood(foodId: String, price: UInt64) {
            pre {
                self.nuggets >= price: "Not enough nuggets"
                price > 0: "Price must be positive"
            }
            self.nuggets = self.nuggets - price
            let current = self.foodInventory[foodId] ?? 0
            self.foodInventory[foodId] = current + 1
            self.pushTx(txType: "nuggets_spent", label: "Bought food: ".concat(foodId), amount: Fix64(price) * -1.0)

            emit FoodPurchased(account: self.owner!.address, foodId: foodId, price: price)
        }

        /// Buy a furniture item (deduct nuggets, add to owned + placed)
        access(Manage) fun buyFurniture(furnitureId: String, price: UInt64) {
            pre {
                self.nuggets >= price: "Not enough nuggets"
                price > 0: "Price must be positive"
                !self.ownedFurniture.contains(furnitureId): "Already owned"
            }
            self.nuggets = self.nuggets - price
            self.ownedFurniture.append(furnitureId)
            self.placedFurniture.append(furnitureId)
            self.pushTx(txType: "nuggets_spent", label: "Bought furniture: ".concat(furnitureId), amount: Fix64(price) * -1.0)

            emit FurniturePurchased(account: self.owner!.address, furnitureId: furnitureId, price: price)
        }

        /// Place owned furniture in the room
        access(Manage) fun placeFurniture(furnitureId: String) {
            pre {
                self.ownedFurniture.contains(furnitureId): "Not owned"
                !self.placedFurniture.contains(furnitureId): "Already placed"
            }
            self.placedFurniture.append(furnitureId)
        }

        /// Remove placed furniture from the room
        access(Manage) fun removeFurniture(furnitureId: String) {
            if let idx = self.placedFurniture.firstIndex(of: furnitureId) {
                self.placedFurniture.remove(at: idx)
            }
        }

        /// Record a PYUSD0 deposit (demo credits)
        access(Manage) fun deposit(amount: UFix64) {
            pre { amount > 0.0: "Amount must be positive" }
            self.depositBalance = self.depositBalance + amount
            self.pushTx(txType: "deposit", label: "Deposit", amount: Fix64(amount))
            emit Deposited(account: self.owner!.address, amount: amount, isUsdc: false)
        }

        /// Record a stgUSDC deposit
        access(Manage) fun depositUsdc(amount: UFix64) {
            pre { amount > 0.0: "Amount must be positive" }
            self.usdcDepositBalance = self.usdcDepositBalance + amount
            self.pushTx(txType: "deposit", label: "USDC Deposit", amount: Fix64(amount))
            emit Deposited(account: self.owner!.address, amount: amount, isUsdc: true)
        }

        /// Record a PYUSD0 withdrawal (demo credits)
        access(Manage) fun withdraw(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be positive"
                amount <= self.depositBalance: "Insufficient deposit balance"
            }
            self.depositBalance = self.depositBalance - amount
            self.pushTx(txType: "withdrawal", label: "Withdrawal", amount: Fix64(amount))
            emit Withdrawn(account: self.owner!.address, amount: amount, isUsdc: false)
        }

        /// Record a stgUSDC withdrawal
        access(Manage) fun withdrawUsdc(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be positive"
                amount <= self.usdcDepositBalance: "Insufficient USDC deposit balance"
            }
            self.usdcDepositBalance = self.usdcDepositBalance - amount
            self.pushTx(txType: "withdrawal", label: "USDC Withdrawal", amount: Fix64(amount))
            emit Withdrawn(account: self.owner!.address, amount: amount, isUsdc: true)
        }

        /// Sync yield accrual from frontend calculation
        access(Manage) fun accrueYield(pyusdEarned: UFix64, usdcEarned: UFix64) {
            self.depositBalance = self.depositBalance + pyusdEarned
            self.usdcDepositBalance = self.usdcDepositBalance + usdcEarned
            let total = pyusdEarned + usdcEarned
            self.totalYieldEarned = self.totalYieldEarned + total
            if total >= 0.01 {
                self.pushTx(txType: "yield", label: "Yield harvested", amount: Fix64(total))
            }
        }

        /// Check daily login and claim streak bonus.
        /// Returns bonus nuggets amount, or nil if already claimed.
        access(Manage) fun checkDailyLogin(today: String, yesterday: String, bonusAmount: UInt64): UInt64? {
            if self.lastLoginDate == today && self.dailyBonusClaimed {
                return nil
            }

            var newStreak = self.currentStreak
            if self.lastLoginDate == today {
                // same day, not yet claimed
            } else if self.lastLoginDate == yesterday {
                newStreak = self.currentStreak + 1
            } else {
                newStreak = 1
            }

            if newStreak > self.longestStreak {
                self.longestStreak = newStreak
            }
            self.currentStreak = newStreak
            self.lastLoginDate = today
            self.dailyBonusClaimed = true
            self.nuggets = self.nuggets + bonusAmount

            self.pushTx(txType: "nuggets_collected", label: "Daily bonus", amount: Fix64(bonusAmount))

            emit DailyBonusClaimed(account: self.owner!.address, streak: newStreak, bonus: bonusAmount)
            return bonusAmount
        }

        /// Update heart count (for heart decay sync)
        access(Manage) fun setHearts(hearts: UInt8) {
            pre { hearts <= YieldPetsProfile.MAX_HEARTS: "Hearts exceed maximum" }
            self.hearts = hearts
        }

        access(Manage) fun setPetName(name: String) {
            pre {
                name.length > 0: "Name cannot be empty"
                name.length <= 32: "Name too long (max 32 characters)"
            }
            self.petName = name
        }

        access(Manage) fun setTrainerName(name: String) {
            pre {
                name.length > 0: "Name cannot be empty"
                name.length <= 32: "Name too long (max 32 characters)"
            }
            self.trainerName = name
        }

        // ========================================
        // Public view functions
        // ========================================

        access(all) view fun getPetName(): String { return self.petName }
        access(all) view fun getTrainerName(): String { return self.trainerName }
        access(all) view fun getHearts(): UInt8 { return self.hearts }
        access(all) view fun getLastFedAt(): UFix64 { return self.lastFedAt }

        access(all) view fun getNuggets(): UInt64 { return self.nuggets }
        access(all) view fun getDepositBalance(): UFix64 { return self.depositBalance }
        access(all) view fun getUsdcDepositBalance(): UFix64 { return self.usdcDepositBalance }
        access(all) view fun getTotalYieldEarned(): UFix64 { return self.totalYieldEarned }

        access(all) view fun getCurrentStreak(): UInt64 { return self.currentStreak }
        access(all) view fun getLongestStreak(): UInt64 { return self.longestStreak }
        access(all) view fun getLastLoginDate(): String { return self.lastLoginDate }
        access(all) view fun getDailyBonusClaimed(): Bool { return self.dailyBonusClaimed }

        access(all) view fun getOwnedFurniture(): [String] { return self.ownedFurniture }
        access(all) view fun getPlacedFurniture(): [String] { return self.placedFurniture }
        access(all) view fun getFoodInventory(): {String: UInt64} { return self.foodInventory }

        access(all) view fun getTransactions(): [TransactionRecord] { return self.transactions }
        access(all) view fun getCreatedAt(): UFix64 { return self.createdAt }

        /// Return entire state as a dictionary for easy frontend consumption
        access(all) view fun getFullState(): {String: AnyStruct} {
            return {
                "petName": self.petName,
                "trainerName": self.trainerName,
                "hearts": self.hearts,
                "lastFedAt": self.lastFedAt,
                "nuggets": self.nuggets,
                "depositBalance": self.depositBalance,
                "usdcDepositBalance": self.usdcDepositBalance,
                "totalYieldEarned": self.totalYieldEarned,
                "currentStreak": self.currentStreak,
                "longestStreak": self.longestStreak,
                "lastLoginDate": self.lastLoginDate,
                "dailyBonusClaimed": self.dailyBonusClaimed,
                "ownedFurniture": self.ownedFurniture,
                "placedFurniture": self.placedFurniture,
                "foodInventory": self.foodInventory,
                "transactions": self.transactions,
                "createdAt": self.createdAt
            }
        }
    }

    // ========================================
    // Factory
    // ========================================

    access(all) fun createProfile(): @Profile {
        return <- create Profile()
    }

    // ========================================
    // Contract Init
    // ========================================

    init() {
        self.ProfileStoragePath = /storage/YieldPetsProfile
        self.ProfilePublicPath = /public/YieldPetsProfile

        self.FEED_BONUS = 5
        self.MAX_HEARTS = 4
        self.MAX_TRANSACTIONS = 200

        emit ProfileCreated(account: self.account.address)
    }
}
