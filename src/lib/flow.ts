import * as fcl from "@onflow/fcl";

fcl.config()
  .put("accessNode.api", process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-mainnet.onflow.org")
  .put("flow.network", process.env.NEXT_PUBLIC_FLOW_NETWORK || "mainnet")
  .put("0xFungibleToken", "0xf233dcee88fe0abe")
  .put("0xFlowToken", "0x1654653399040a61");

export const GET_COA_ADDRESS = `
import EVM from 0xe467b9dd11fa00df

access(all) fun main(address: Address): String? {
    let acct = getAccount(address)
    let cap = acct.capabilities.borrow<&EVM.CadenceOwnedAccount>(/public/evm)
    if cap == nil {
        return nil
    }
    let evmAddr = cap!.address()
    let bytes = evmAddr.bytes
    let table: [String] = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
    var result = "0x"
    for byte in bytes {
        result = result.concat(table[Int(byte / 16)]).concat(table[Int(byte % 16)])
    }
    return result
}
`;

export const CREATE_COA = `
import EVM from 0xe467b9dd11fa00df

transaction {
    prepare(signer: auth(SaveValue, BorrowValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        if signer.storage.type(at: /storage/evm) == nil {
            let coa <- EVM.createCadenceOwnedAccount()
            signer.storage.save(<-coa, to: /storage/evm)
        }

        if !signer.capabilities.get<&EVM.CadenceOwnedAccount>(/public/evm).check() {
            let cap = signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(/storage/evm)
            signer.capabilities.publish(cap, at: /public/evm)
        }
    }

    execute {

    }
}
`;

export const CHECK_PYUSD_VAULT = `
import FungibleToken from 0xf233dcee88fe0abe
import FungibleTokenMetadataViews from 0xf233dcee88fe0abe
import EVMVMBridgedToken_99af3eea856556646c98c8b9b2548fe815240750 from 0x1e4aa0b87d10b141

access(all) fun main(address: Address): Bool {
    let vaultData = EVMVMBridgedToken_99af3eea856556646c98c8b9b2548fe815240750.resolveContractView(
        resourceType: nil,
        viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
    ) as! FungibleTokenMetadataViews.FTVaultData?
    if vaultData == nil { return false }

    let acct = getAccount(address)
    return acct.capabilities.get<&{FungibleToken.Receiver}>(vaultData!.receiverPath).check()
}
`;

export const SETUP_PYUSD_VAULT = `
import FungibleToken from 0xf233dcee88fe0abe
import FungibleTokenMetadataViews from 0xf233dcee88fe0abe
import EVMVMBridgedToken_99af3eea856556646c98c8b9b2548fe815240750 from 0x1e4aa0b87d10b141

transaction {
    prepare(signer: auth(SaveValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        let vaultData = EVMVMBridgedToken_99af3eea856556646c98c8b9b2548fe815240750.resolveContractView(
            resourceType: nil,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        ) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData for PYUSD0")

        if signer.storage.type(at: vaultData.storagePath) != nil {
            return
        }

        let vault <- EVMVMBridgedToken_99af3eea856556646c98c8b9b2548fe815240750.createEmptyVault(vaultType: Type<@EVMVMBridgedToken_99af3eea856556646c98c8b9b2548fe815240750.Vault>())
        signer.storage.save(<-vault, to: vaultData.storagePath)

        let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(vaultData.storagePath)
        signer.capabilities.publish(receiverCap, at: vaultData.receiverPath)

        let vaultCap = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(vaultData.storagePath)
        signer.capabilities.publish(vaultCap, at: vaultData.metadataPath)
    }

    execute {

    }
}
`;

// ─── YieldPetsUSDCVault (stgUSDC → MoreMarkets lending) ──────

// Contract deployer address — update this after mainnet deployment
const USDC_VAULT_CONTRACT_ADDRESS = "0x73fa40543604c4aa";

export const SETUP_USDC_LENDING_VAULT = `
import EVM from 0xe467b9dd11fa00df
import YieldPetsUSDCVault from ${USDC_VAULT_CONTRACT_ADDRESS}

transaction {
    prepare(signer: auth(SaveValue, BorrowValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        // Step 1: Create COA if it doesn't exist
        if signer.storage.type(at: /storage/evm) == nil {
            let coa <- EVM.createCadenceOwnedAccount()
            signer.storage.save(<-coa, to: /storage/evm)
        }

        // Step 2: Issue EVM.Call capability for the COA
        let evmCap = signer.capabilities.storage.issue<auth(EVM.Call) &EVM.CadenceOwnedAccount>(
            /storage/evm
        )

        // Step 3: Create USDC VaultPosition if it doesn't exist
        if signer.storage.type(at: YieldPetsUSDCVault.VaultStoragePath) == nil {
            let vault <- YieldPetsUSDCVault.createVaultPosition(evmCap: evmCap)
            signer.storage.save(<-vault, to: YieldPetsUSDCVault.VaultStoragePath)

            let publicCap = signer.capabilities.storage.issue<&{YieldPetsUSDCVault.VaultPositionPublic}>(
                YieldPetsUSDCVault.VaultStoragePath
            )
            signer.capabilities.publish(publicCap, at: YieldPetsUSDCVault.VaultPublicPath)
        }
    }

    execute {}
}
`;

export const DEPOSIT_STGUSDC = `
import YieldPetsUSDCVault from ${USDC_VAULT_CONTRACT_ADDRESS}

transaction(amount: UFix64) {
    let vault: auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition>(
            from: YieldPetsUSDCVault.VaultStoragePath
        ) ?? panic("USDC VaultPosition not found. Run setup first.")
    }

    execute {
        self.vault.deposit(amount: amount)
    }
}
`;

export const WITHDRAW_STGUSDC = `
import YieldPetsUSDCVault from ${USDC_VAULT_CONTRACT_ADDRESS}

transaction(amount: UFix64) {
    let vault: auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(YieldPetsUSDCVault.Manage) &YieldPetsUSDCVault.VaultPosition>(
            from: YieldPetsUSDCVault.VaultStoragePath
        ) ?? panic("USDC VaultPosition not found.")
    }

    execute {
        if amount == 0.0 {
            self.vault.withdrawAll()
        } else {
            self.vault.withdraw(amount: amount)
        }
    }
}
`;

export const GET_USDC_VAULT_POSITION = `
import YieldPetsUSDCVault from ${USDC_VAULT_CONTRACT_ADDRESS}

access(all) fun main(account: Address): {String: AnyStruct} {
    let acct = getAccount(account)
    let vault = acct.capabilities.borrow<&{YieldPetsUSDCVault.VaultPositionPublic}>(
        YieldPetsUSDCVault.VaultPublicPath
    ) ?? panic("No USDC VaultPosition found.")

    let totalDeposited = vault.getTotalDeposited()
    let firstDeposit = vault.getFirstDepositTimestamp()
    let lastDeposit = vault.getLastDepositTimestamp()
    let depositCount = vault.getDepositCount()
    let growthScore = vault.getGrowthScore()
    let aTokenBalance = vault.queryATokenBalance()
    let evmAddress = vault.getEVMAddressHex()

    return {
        "totalDeposited": totalDeposited,
        "firstDepositTimestamp": firstDeposit,
        "lastDepositTimestamp": lastDeposit,
        "depositCount": depositCount,
        "growthScore": growthScore,
        "aTokenBalance": aTokenBalance,
        "evmAddress": evmAddress
    }
}
`;

export const CHECK_STGUSDC_BALANCE = `
import EVM from 0xe467b9dd11fa00df

access(all) fun main(address: Address): UInt256 {
    let acct = getAccount(address)
    let cap = acct.capabilities.borrow<&EVM.CadenceOwnedAccount>(/public/evm)
    if cap == nil { return 0 }

    let coa = cap!
    let stgusdc = EVM.addressFromString("0xf1815bd50389c46847f0bda824ec8da914045d14")

    let balancePayload = EVM.encodeABIWithSignature(
        "balanceOf(address)",
        [coa.address()]
    )

    let res = coa.call(
        to: stgusdc,
        data: balancePayload,
        gasLimit: 100000,
        value: EVM.Balance(attoflow: 0)
    )

    if res.status != EVM.Status.successful { return 0 }
    let decoded = EVM.decodeABI(types: [Type<UInt256>()], data: res.data)
    return decoded[0] as! UInt256
}
`;

// ─── YieldPetsProfile (on-chain game state) ──────

const PROFILE_CONTRACT_ADDRESS = "0x73fa40543604c4aa";

export const SETUP_PROFILE = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

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
`;

export const GET_PROFILE = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

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
`;

export const PROFILE_FEED = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(foodId: String, heartRestore: UInt8) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        let food: String? = foodId.length > 0 ? foodId : nil
        profile.feed(foodId: food, heartRestore: heartRestore)
    }
}
`;

export const PROFILE_BUY_FOOD = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(foodId: String, price: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.buyFood(foodId: foodId, price: price)
    }
}
`;

export const PROFILE_BUY_FURNITURE = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(furnitureId: String, price: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.buyFurniture(furnitureId: furnitureId, price: price)
    }
}
`;

export const PROFILE_PLACE_FURNITURE = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(furnitureId: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.placeFurniture(furnitureId: furnitureId)
    }
}
`;

export const PROFILE_REMOVE_FURNITURE = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(furnitureId: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.removeFurniture(furnitureId: furnitureId)
    }
}
`;

export const PROFILE_SET_PET_NAME = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(name: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.setPetName(name: name)
    }
}
`;

export const PROFILE_SET_TRAINER_NAME = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(name: String) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.setTrainerName(name: name)
    }
}
`;

export const PROFILE_DAILY_LOGIN = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(today: String, yesterday: String, bonusAmount: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.checkDailyLogin(today: today, yesterday: yesterday, bonusAmount: bonusAmount)
    }
}
`;

export const PROFILE_ACCRUE_YIELD = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(pyusdEarned: UFix64, usdcEarned: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.accrueYield(pyusdEarned: pyusdEarned, usdcEarned: usdcEarned)
    }
}
`;

export const PROFILE_DEPOSIT = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(amount: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.deposit(amount: amount)
    }
}
`;

export const PROFILE_DEPOSIT_USDC = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(amount: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.depositUsdc(amount: amount)
    }
}
`;

export const PROFILE_WITHDRAW = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(amount: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.withdraw(amount: amount)
    }
}
`;

export const PROFILE_WITHDRAW_USDC = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(amount: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.withdrawUsdc(amount: amount)
    }
}
`;

export const PROFILE_SET_HEARTS = `
import YieldPetsProfile from ${PROFILE_CONTRACT_ADDRESS}

transaction(hearts: UInt8) {
    prepare(signer: auth(Storage) &Account) {
        let profile = signer.storage.borrow<auth(YieldPetsProfile.Manage) &YieldPetsProfile.Profile>(
            from: YieldPetsProfile.ProfileStoragePath
        ) ?? panic("Profile not found")

        profile.setHearts(hearts: hearts)
    }
}
`;

export const GET_USDC_DEPOSIT_HISTORY = `
import YieldPetsUSDCVault from ${USDC_VAULT_CONTRACT_ADDRESS}

access(all) fun main(account: Address): [YieldPetsUSDCVault.DepositRecord] {
    let acct = getAccount(account)
    let vault = acct.capabilities.borrow<&{YieldPetsUSDCVault.VaultPositionPublic}>(
        YieldPetsUSDCVault.VaultPublicPath
    )
    if vault == nil { return [] }
    return vault!.getDeposits()
}
`;

export const TRANSFER_FLOW = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

transaction(amount: UFix64, to: Address) {
    let sentVault: @{FungibleToken.Vault}

    prepare(signer: auth(BorrowValue) &Account) {
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let receiverRef = getAccount(to)
            .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")
        receiverRef.deposit(from: <-self.sentVault)
    }
}
`;
