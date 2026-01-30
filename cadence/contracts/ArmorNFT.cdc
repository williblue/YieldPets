import NonFungibleToken from "./core/NonFungibleToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"

/// ArmorNFT - Collectible equipment pieces for YieldGotchi
///
/// Armor is unlocked by claiming yield from the vault
/// Each piece has a rarity and slot (head, body, weapon, pet)
access(all) contract ArmorNFT: NonFungibleToken {

    // ========================================
    // Events
    // ========================================

    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event ArmorMinted(id: UInt64, name: String, rarity: String, slot: String, owner: Address)

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

    access(all) enum Rarity: UInt8 {
        access(all) case common
        access(all) case rare
        access(all) case epic
        access(all) case legendary
    }

    access(all) enum Slot: UInt8 {
        access(all) case head
        access(all) case body
        access(all) case weapon
        access(all) case pet
    }

    // ========================================
    // Rarity Distribution
    // ========================================

    // Returns a random rarity based on weighted probabilities
    // Common: 50%, Rare: 30%, Epic: 15%, Legendary: 5%
    access(all) fun getRandomRarity(seed: UInt64): Rarity {
        let random = unsafeRandom() % 100

        if random < 50 {
            return Rarity.common
        } else if random < 80 {
            return Rarity.rare
        } else if random < 95 {
            return Rarity.epic
        } else {
            return Rarity.legendary
        }
    }

    // ========================================
    // Armor Templates
    // ========================================

    access(all) struct ArmorTemplate {
        access(all) let name: String
        access(all) let slot: Slot
        access(all) let rarity: Rarity

        init(name: String, slot: Slot, rarity: Rarity) {
            self.name = name
            self.slot = slot
            self.rarity = rarity
        }
    }

    // Predefined armor templates
    access(all) let armorTemplates: {String: ArmorTemplate}

    access(all) fun initializeTemplates() {
        // Head armor
        self.armorTemplates["simple_cap"] = ArmorTemplate(name: "Simple Cap", slot: Slot.head, rarity: Rarity.common)
        self.armorTemplates["iron_helm"] = ArmorTemplate(name: "Iron Helm", slot: Slot.head, rarity: Rarity.rare)
        self.armorTemplates["dragon_crown"] = ArmorTemplate(name: "Dragon Crown", slot: Slot.head, rarity: Rarity.epic)
        self.armorTemplates["celestial_halo"] = ArmorTemplate(name: "Celestial Halo", slot: Slot.head, rarity: Rarity.legendary)

        // Body armor
        self.armorTemplates["leather_vest"] = ArmorTemplate(name: "Leather Vest", slot: Slot.body, rarity: Rarity.common)
        self.armorTemplates["chain_mail"] = ArmorTemplate(name: "Chain Mail", slot: Slot.body, rarity: Rarity.rare)
        self.armorTemplates["plate_armor"] = ArmorTemplate(name: "Plate Armor", slot: Slot.body, rarity: Rarity.epic)
        self.armorTemplates["cosmic_suit"] = ArmorTemplate(name: "Cosmic Suit", slot: Slot.body, rarity: Rarity.legendary)

        // Weapons
        self.armorTemplates["wooden_stick"] = ArmorTemplate(name: "Wooden Stick", slot: Slot.weapon, rarity: Rarity.common)
        self.armorTemplates["steel_sword"] = ArmorTemplate(name: "Steel Sword", slot: Slot.weapon, rarity: Rarity.rare)
        self.armorTemplates["flame_blade"] = ArmorTemplate(name: "Flame Blade", slot: Slot.weapon, rarity: Rarity.epic)
        self.armorTemplates["void_scythe"] = ArmorTemplate(name: "Void Scythe", slot: Slot.weapon, rarity: Rarity.legendary)

        // Pets
        self.armorTemplates["friendly_slime"] = ArmorTemplate(name: "Friendly Slime", slot: Slot.pet, rarity: Rarity.common)
        self.armorTemplates["magic_fox"] = ArmorTemplate(name: "Magic Fox", slot: Slot.pet, rarity: Rarity.rare)
        self.armorTemplates["phoenix_chick"] = ArmorTemplate(name: "Phoenix Chick", slot: Slot.pet, rarity: Rarity.epic)
        self.armorTemplates["star_dragon"] = ArmorTemplate(name: "Star Dragon", slot: Slot.pet, rarity: Rarity.legendary)
    }

    // ========================================
    // NFT Resource
    // ========================================

    access(all) resource NFT: NonFungibleToken.NFT {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let rarity: Rarity
        access(all) let slot: Slot
        access(all) let unlockedAt: UFix64
        access(all) var equipped: Bool

        init(
            id: UInt64,
            name: String,
            rarity: Rarity,
            slot: Slot
        ) {
            self.id = id
            self.name = name
            self.rarity = rarity
            self.slot = slot
            self.unlockedAt = getCurrentBlock().timestamp
            self.equipped = false
        }

        access(all) fun setEquipped(equipped: Bool) {
            self.equipped = equipped
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
                        description: self.rarity.rawValue.toString().concat(" ").concat(self.slot.rawValue.toString()).concat(" armor"),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://yieldgotchi.io/armor/".concat(self.id.toString())
                        )
                    )
            }
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-ArmorNFT.createEmptyCollection(nftType: Type<@ArmorNFT.NFT>())
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

        access(all) fun borrowArmor(id: UInt64): &ArmorNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as &{NonFungibleToken.NFT}?
                return ref as! &ArmorNFT.NFT
            }
            return nil
        }

        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("Cannot withdraw: Armor does not exist in collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let token <- token as! @ArmorNFT.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            return {Type<@ArmorNFT.NFT>(): true}
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@ArmorNFT.NFT>()
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-ArmorNFT.createEmptyCollection(nftType: Type<@ArmorNFT.NFT>())
        }
    }

    // ========================================
    // Minter Resource
    // ========================================

    access(all) resource NFTMinter {
        // Mint random armor based on rarity distribution
        access(all) fun mintRandomArmor(recipient: &{NonFungibleToken.CollectionPublic}, slot: Slot): UInt64 {
            let rarity = ArmorNFT.getRandomRarity(seed: ArmorNFT.totalSupply)
            return self.mintArmor(recipient: recipient, slot: slot, rarity: rarity)
        }

        // Mint specific armor
        access(all) fun mintArmor(recipient: &{NonFungibleToken.CollectionPublic}, slot: Slot, rarity: Rarity): UInt64 {
            let templateName = self.getTemplateForSlotAndRarity(slot: slot, rarity: rarity)
            let template = ArmorNFT.armorTemplates[templateName]!

            let newArmor <- create NFT(
                id: ArmorNFT.totalSupply,
                name: template.name,
                rarity: rarity,
                slot: slot
            )

            let armorId = newArmor.id
            emit ArmorMinted(
                id: armorId,
                name: template.name,
                rarity: rarity.rawValue.toString(),
                slot: slot.rawValue.toString(),
                owner: recipient.owner!.address
            )

            recipient.deposit(token: <-newArmor)
            ArmorNFT.totalSupply = ArmorNFT.totalSupply + 1

            return armorId
        }

        access(self) fun getTemplateForSlotAndRarity(slot: Slot, rarity: Rarity): String {
            // Map slot and rarity to template name
            // This is simplified - in production you'd have more variety
            if slot == Slot.head {
                switch rarity {
                    case Rarity.common: return "simple_cap"
                    case Rarity.rare: return "iron_helm"
                    case Rarity.epic: return "dragon_crown"
                    case Rarity.legendary: return "celestial_halo"
                }
            } else if slot == Slot.body {
                switch rarity {
                    case Rarity.common: return "leather_vest"
                    case Rarity.rare: return "chain_mail"
                    case Rarity.epic: return "plate_armor"
                    case Rarity.legendary: return "cosmic_suit"
                }
            } else if slot == Slot.weapon {
                switch rarity {
                    case Rarity.common: return "wooden_stick"
                    case Rarity.rare: return "steel_sword"
                    case Rarity.epic: return "flame_blade"
                    case Rarity.legendary: return "void_scythe"
                }
            } else { // pet
                switch rarity {
                    case Rarity.common: return "friendly_slime"
                    case Rarity.rare: return "magic_fox"
                    case Rarity.epic: return "phoenix_chick"
                    case Rarity.legendary: return "star_dragon"
                }
            }
            return "simple_cap" // fallback
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
        self.armorTemplates = {}

        self.CollectionStoragePath = /storage/ArmorNFTCollection
        self.CollectionPublicPath = /public/ArmorNFTCollection
        self.MinterStoragePath = /storage/ArmorNFTMinter

        // Initialize armor templates
        self.initializeTemplates()

        // Create and save minter resource
        self.account.storage.save(<-create NFTMinter(), to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
