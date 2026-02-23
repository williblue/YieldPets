import "EVM"

/// YieldPetsVault - Cadence contract that deposits PYUSD0 into MoreMarkets
/// lending (Aave V3 fork on Flow EVM) and tracks positions on-chain.
///
/// Flow:
///   1. User creates a COA (Cadence Owned Account) → gets an EVM address
///   2. User sends PYUSD0 to that EVM address
///   3. This contract calls pool.supply() via the COA to earn ~10% APY
///   4. Deposits/withdrawals are tracked in Cadence for pet growth scoring
access(all) contract YieldPetsVault {

    // ========================================
    // Entitlements
    // ========================================

    access(all) entitlement Manage

    // ========================================
    // Constants - MoreMarkets (Aave V3) on Flow EVM
    // ========================================

    access(all) let MOREMARKETS_POOL: String       // 0xbC92aaC2DBBF42215248B5688eB3D3d2b32F2c8d
    access(all) let POOL_DATA_PROVIDER: String     // 0x79e71e3c0EDF2B88b0aB38E9A1eF0F6a230e56bf
    access(all) let PYUSD0: String                 // 0x99aF3EeA856556646C98c8B9b2548Fe815240750
    access(all) let PYUSD0_DECIMALS: UInt8         // 6

    // ========================================
    // Paths
    // ========================================

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath

    // ========================================
    // Events
    // ========================================

    access(all) event ContractInitialized()
    access(all) event VaultPositionCreated(account: Address)
    access(all) event Deposited(account: Address, amount: UFix64, totalDeposited: UFix64, timestamp: UFix64)
    access(all) event Withdrawn(account: Address, amount: UFix64, totalDeposited: UFix64, timestamp: UFix64)

    // ========================================
    // Structs
    // ========================================

    access(all) struct DepositRecord {
        access(all) let amount: UFix64
        access(all) let timestamp: UFix64

        init(amount: UFix64) {
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
        }
    }

    // ========================================
    // Public Interface (readable by anyone)
    // ========================================

    access(all) resource interface VaultPositionPublic {
        access(all) view fun getTotalDeposited(): UFix64
        access(all) view fun getFirstDepositTimestamp(): UFix64
        access(all) view fun getLastDepositTimestamp(): UFix64
        access(all) view fun getDepositCount(): Int
        access(all) view fun getGrowthScore(): UFix64
        access(all) fun queryATokenBalance(): UInt256
        access(all) fun getEVMAddressHex(): String
    }

    // ========================================
    // VaultPosition Resource (one per user)
    // ========================================

    access(all) resource VaultPosition: VaultPositionPublic {
        /// Capability to user's COA for EVM calls
        access(self) let evmCap: Capability<auth(EVM.Call) &EVM.CadenceOwnedAccount>

        /// Cadence-side tracking
        access(all) var totalDeposited: UFix64
        access(all) var deposits: [DepositRecord]

        init(evmCap: Capability<auth(EVM.Call) &EVM.CadenceOwnedAccount>) {
            self.evmCap = evmCap
            self.totalDeposited = 0.0
            self.deposits = []
        }

        // ============================
        // Manage (owner-only) functions
        // ============================

        /// Deposit PYUSD0 into MoreMarkets lending pool.
        /// PYUSD0 must already be in the COA's EVM address.
        access(Manage) fun deposit(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be positive"
            }

            let coa = self.evmCap.borrow()
                ?? panic("YieldPetsVault: invalid COA capability")

            let pool = EVM.addressFromString(YieldPetsVault.MOREMARKETS_POOL)
            let pyusd0 = EVM.addressFromString(YieldPetsVault.PYUSD0)
            let amountScaled = YieldPetsVault.ufix64ToUInt256(
                value: amount,
                decimals: YieldPetsVault.PYUSD0_DECIMALS
            )

            // Step 1: Approve PYUSD0 for the MoreMarkets Pool (if needed)
            YieldPetsVault.ensureAllowance(
                coa: coa,
                token: pyusd0,
                spender: pool,
                amount: amountScaled
            )

            // Step 2: Call pool.supply(asset, amount, onBehalfOf, referralCode)
            let supplyPayload = EVM.encodeABIWithSignature(
                "supply(address,uint256,address,uint16)",
                [pyusd0, amountScaled, coa.address(), UInt256(0)]
            )

            let res = coa.call(
                to: pool,
                data: supplyPayload,
                gasLimit: 500000,
                value: EVM.Balance(attoflow: 0)
            )

            assert(
                res.status == EVM.Status.successful,
                message: "YieldPetsVault: supply failed | Status: "
                    .concat(res.status.rawValue.toString())
            )

            // Track on-chain
            self.totalDeposited = self.totalDeposited + amount
            self.deposits.append(DepositRecord(amount: amount))

            emit Deposited(
                account: self.owner!.address,
                amount: amount,
                totalDeposited: self.totalDeposited,
                timestamp: getCurrentBlock().timestamp
            )
        }

        /// Withdraw a specific amount of PYUSD0 from MoreMarkets.
        /// Tokens are returned to the COA's EVM address.
        access(Manage) fun withdraw(amount: UFix64) {
            pre {
                amount > 0.0: "Amount must be positive"
            }

            let coa = self.evmCap.borrow()
                ?? panic("YieldPetsVault: invalid COA capability")

            let pool = EVM.addressFromString(YieldPetsVault.MOREMARKETS_POOL)
            let pyusd0 = EVM.addressFromString(YieldPetsVault.PYUSD0)
            let amountScaled = YieldPetsVault.ufix64ToUInt256(
                value: amount,
                decimals: YieldPetsVault.PYUSD0_DECIMALS
            )

            let withdrawPayload = EVM.encodeABIWithSignature(
                "withdraw(address,uint256,address)",
                [pyusd0, amountScaled, coa.address()]
            )

            let res = coa.call(
                to: pool,
                data: withdrawPayload,
                gasLimit: 500000,
                value: EVM.Balance(attoflow: 0)
            )

            assert(
                res.status == EVM.Status.successful,
                message: "YieldPetsVault: withdraw failed | Status: "
                    .concat(res.status.rawValue.toString())
            )

            // Update tracked principal
            if amount <= self.totalDeposited {
                self.totalDeposited = self.totalDeposited - amount
            } else {
                self.totalDeposited = 0.0
            }

            emit Withdrawn(
                account: self.owner!.address,
                amount: amount,
                totalDeposited: self.totalDeposited,
                timestamp: getCurrentBlock().timestamp
            )
        }

        /// Withdraw ALL PYUSD0 (principal + accrued yield) from MoreMarkets.
        /// Uses uint256.max to trigger Aave V3 full withdrawal.
        access(Manage) fun withdrawAll() {
            let coa = self.evmCap.borrow()
                ?? panic("YieldPetsVault: invalid COA capability")

            let pool = EVM.addressFromString(YieldPetsVault.MOREMARKETS_POOL)
            let pyusd0 = EVM.addressFromString(YieldPetsVault.PYUSD0)

            // type(uint256).max signals "withdraw everything" to Aave V3
            let maxUint256: UInt256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935

            let withdrawPayload = EVM.encodeABIWithSignature(
                "withdraw(address,uint256,address)",
                [pyusd0, maxUint256, coa.address()]
            )

            let res = coa.call(
                to: pool,
                data: withdrawPayload,
                gasLimit: 500000,
                value: EVM.Balance(attoflow: 0)
            )

            assert(
                res.status == EVM.Status.successful,
                message: "YieldPetsVault: withdrawAll failed | Status: "
                    .concat(res.status.rawValue.toString())
            )

            let previousTotal = self.totalDeposited
            self.totalDeposited = 0.0

            emit Withdrawn(
                account: self.owner!.address,
                amount: previousTotal,
                totalDeposited: 0.0,
                timestamp: getCurrentBlock().timestamp
            )
        }

        // ============================
        // Public view functions
        // ============================

        access(all) view fun getTotalDeposited(): UFix64 {
            return self.totalDeposited
        }

        access(all) view fun getFirstDepositTimestamp(): UFix64 {
            if self.deposits.length > 0 {
                return self.deposits[0].timestamp
            }
            return 0.0
        }

        access(all) view fun getLastDepositTimestamp(): UFix64 {
            if self.deposits.length > 0 {
                return self.deposits[self.deposits.length - 1].timestamp
            }
            return 0.0
        }

        access(all) view fun getDepositCount(): Int {
            return self.deposits.length
        }

        /// Growth score: log10(1 + principal) * daysLocked
        /// Matches the formula in YieldPets.cdc for pet evolution
        access(all) view fun getGrowthScore(): UFix64 {
            if self.totalDeposited == 0.0 || self.deposits.length == 0 {
                return 0.0
            }
            let now = getCurrentBlock().timestamp
            let firstDeposit = self.deposits[0].timestamp
            let daysLocked = (now - firstDeposit) / 86400.0

            let logApprox = YieldPetsVault.approxLog10(1.0 + self.totalDeposited)
            return logApprox * daysLocked
        }

        /// Query the live aToken balance on MoreMarkets (principal + accrued yield).
        /// Makes two EVM calls: getReserveTokensAddresses → balanceOf(aToken).
        access(all) fun queryATokenBalance(): UInt256 {
            let coa = self.evmCap.borrow()
                ?? panic("YieldPetsVault: invalid COA capability")

            let dataProvider = EVM.addressFromString(YieldPetsVault.POOL_DATA_PROVIDER)
            let pyusd0 = EVM.addressFromString(YieldPetsVault.PYUSD0)

            // Step 1: Get aToken address from PoolDataProvider
            let getTokensPayload = EVM.encodeABIWithSignature(
                "getReserveTokensAddresses(address)",
                [pyusd0]
            )

            let tokensRes = coa.call(
                to: dataProvider,
                data: getTokensPayload,
                gasLimit: 200000,
                value: EVM.Balance(attoflow: 0)
            )

            if tokensRes.status != EVM.Status.successful {
                return 0
            }

            let tokenAddrs = EVM.decodeABI(
                types: [
                    Type<EVM.EVMAddress>(), // aTokenAddress
                    Type<EVM.EVMAddress>(), // stableDebtTokenAddress
                    Type<EVM.EVMAddress>()  // variableDebtTokenAddress
                ],
                data: tokensRes.data
            )
            let aToken = tokenAddrs[0] as! EVM.EVMAddress

            // Step 2: Query aToken.balanceOf(coa)
            let balancePayload = EVM.encodeABIWithSignature(
                "balanceOf(address)",
                [coa.address()]
            )

            let balanceRes = coa.call(
                to: aToken,
                data: balancePayload,
                gasLimit: 200000,
                value: EVM.Balance(attoflow: 0)
            )

            if balanceRes.status != EVM.Status.successful {
                return 0
            }

            let decoded = EVM.decodeABI(types: [Type<UInt256>()], data: balanceRes.data)
            return decoded[0] as! UInt256
        }

        /// Returns the COA's EVM address as hex string.
        /// Users need this to send PYUSD0 to their COA before depositing.
        access(all) fun getEVMAddressHex(): String {
            let coa = self.evmCap.borrow()
                ?? panic("YieldPetsVault: invalid COA capability")
            return coa.address().toString()
        }
    }

    // ========================================
    // Contract-Level Helpers
    // ========================================

    /// Convert UFix64 to UInt256 with the specified number of decimals.
    /// e.g. ufix64ToUInt256(value: 100.5, decimals: 6) → 100500000
    access(all) fun ufix64ToUInt256(value: UFix64, decimals: UInt8): UInt256 {
        let intPart = UInt256(UInt64(value))
        let fracPart = value - UFix64(UInt64(value))

        // Build 10^decimals
        var power: UInt256 = 1
        var i: UInt8 = 0
        while i < decimals {
            power = power * 10
            i = i + 1
        }

        // whole * 10^decimals
        var result = intPart * power

        // Add fractional contribution
        // UFix64 has 8 implicit decimal places, so fracPart * 10^8 is exact
        if fracPart > 0.0 {
            let frac8 = UInt256(fracPart * 100000000.0)
            if decimals >= 8 {
                var extra: UInt256 = 1
                var j: UInt8 = 0
                while j < (decimals - 8) {
                    extra = extra * 10
                    j = j + 1
                }
                result = result + frac8 * extra
            } else {
                var divisor: UInt256 = 1
                var j: UInt8 = 0
                while j < (8 - decimals) {
                    divisor = divisor * 10
                    j = j + 1
                }
                result = result + frac8 / divisor
            }
        }

        return result
    }

    /// Ensure ERC-20 allowance for a spender, approving max if insufficient
    access(all) fun ensureAllowance(
        coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
        token: EVM.EVMAddress,
        spender: EVM.EVMAddress,
        amount: UInt256
    ) {
        let allowanceCalldata = EVM.encodeABIWithSignature(
            "allowance(address,address)",
            [coa.address(), spender]
        )

        let allowanceRes = coa.call(
            to: token,
            data: allowanceCalldata,
            gasLimit: 100000,
            value: EVM.Balance(attoflow: 0)
        )

        if allowanceRes.status == EVM.Status.successful {
            let decoded = EVM.decodeABI(types: [Type<UInt256>()], data: allowanceRes.data)
            let currentAllowance = decoded[0] as! UInt256

            if currentAllowance < amount {
                let maxApproval: UInt256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935
                let approveCalldata = EVM.encodeABIWithSignature(
                    "approve(address,uint256)",
                    [spender, maxApproval]
                )

                let approveRes = coa.call(
                    to: token,
                    data: approveCalldata,
                    gasLimit: 100000,
                    value: EVM.Balance(attoflow: 0)
                )

                assert(
                    approveRes.status == EVM.Status.successful,
                    message: "YieldPetsVault: token approval failed"
                )
            }
        }
    }

    /// Piecewise linear approximation of log10 for growth score
    access(all) view fun approxLog10(_ x: UFix64): UFix64 {
        if x <= 1.0 { return 0.0 }
        if x <= 10.0 { return (x - 1.0) / 9.0 }
        if x <= 100.0 { return 1.0 + (x - 10.0) / 90.0 }
        if x <= 1000.0 { return 2.0 + (x - 100.0) / 900.0 }
        if x <= 10000.0 { return 3.0 + (x - 1000.0) / 9000.0 }
        if x <= 100000.0 { return 4.0 + (x - 10000.0) / 90000.0 }
        return 5.0
    }

    // ========================================
    // Factory
    // ========================================

    access(all) fun createVaultPosition(
        evmCap: Capability<auth(EVM.Call) &EVM.CadenceOwnedAccount>
    ): @VaultPosition {
        return <- create VaultPosition(evmCap: evmCap)
    }

    // ========================================
    // Contract Init
    // ========================================

    init() {
        self.MOREMARKETS_POOL = "0xbC92aaC2DBBF42215248B5688eB3D3d2b32F2c8d"
        self.POOL_DATA_PROVIDER = "0x79e71e3c0EDF2B88b0aB38E9A1eF0F6a230e56bf"
        self.PYUSD0 = "0x99aF3EeA856556646C98c8B9b2548Fe815240750"
        self.PYUSD0_DECIMALS = 6

        self.VaultStoragePath = /storage/YieldPetsVault
        self.VaultPublicPath = /public/YieldPetsVault

        emit ContractInitialized()
    }
}
