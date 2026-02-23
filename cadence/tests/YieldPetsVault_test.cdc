import Test
import "EVM"

// ========================================
// Setup: deploy contract before tests
// ========================================

access(all)
fun setup() {
    let err = Test.deployContract(
        name: "YieldPetsVault",
        path: "../contracts/YieldPetsVault.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

// ========================================
// Helper: run a script importing YieldPetsVault
// ========================================

access(all)
fun runVaultScript(_ body: String, _ args: [AnyStruct]): Test.ScriptResult {
    let script = "import \"YieldPetsVault\"\n".concat(body)
    return Test.executeScript(script, args)
}

// ========================================
// Test: ufix64ToUInt256 conversion helper
// ========================================

access(all)
fun testUfix64ToUInt256_WholeNumber() {
    let result = runVaultScript(
        "access(all) fun main(): UInt256 { return YieldPetsVault.ufix64ToUInt256(value: 100.0, decimals: 6) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(UInt256(100_000_000), result.returnValue! as! UInt256)
}

access(all)
fun testUfix64ToUInt256_Fractional() {
    let result = runVaultScript(
        "access(all) fun main(): UInt256 { return YieldPetsVault.ufix64ToUInt256(value: 100.5, decimals: 6) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(UInt256(100_500_000), result.returnValue! as! UInt256)
}

access(all)
fun testUfix64ToUInt256_SmallAmount() {
    let result = runVaultScript(
        "access(all) fun main(): UInt256 { return YieldPetsVault.ufix64ToUInt256(value: 0.000001, decimals: 6) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(UInt256(1), result.returnValue! as! UInt256)
}

access(all)
fun testUfix64ToUInt256_Zero() {
    let result = runVaultScript(
        "access(all) fun main(): UInt256 { return YieldPetsVault.ufix64ToUInt256(value: 0.0, decimals: 6) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(UInt256(0), result.returnValue! as! UInt256)
}

access(all)
fun testUfix64ToUInt256_18Decimals() {
    let result = runVaultScript(
        "access(all) fun main(): UInt256 { return YieldPetsVault.ufix64ToUInt256(value: 1.0, decimals: 18) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(UInt256(1_000_000_000_000_000_000), result.returnValue! as! UInt256)
}

access(all)
fun testUfix64ToUInt256_LargeAmount() {
    // 50000.0 PYUSD0 with 6 decimals → 50_000_000_000
    let result = runVaultScript(
        "access(all) fun main(): UInt256 { return YieldPetsVault.ufix64ToUInt256(value: 50000.0, decimals: 6) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(UInt256(50_000_000_000), result.returnValue! as! UInt256)
}

// ========================================
// Test: approxLog10
// ========================================

access(all)
fun testApproxLog10_One() {
    let result = runVaultScript(
        "access(all) fun main(): UFix64 { return YieldPetsVault.approxLog10(1.0) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(0.0, result.returnValue! as! UFix64)
}

access(all)
fun testApproxLog10_Ten() {
    let result = runVaultScript(
        "access(all) fun main(): UFix64 { return YieldPetsVault.approxLog10(10.0) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(1.0, result.returnValue! as! UFix64)
}

access(all)
fun testApproxLog10_Hundred() {
    let result = runVaultScript(
        "access(all) fun main(): UFix64 { return YieldPetsVault.approxLog10(100.0) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(2.0, result.returnValue! as! UFix64)
}

access(all)
fun testApproxLog10_Thousand() {
    let result = runVaultScript(
        "access(all) fun main(): UFix64 { return YieldPetsVault.approxLog10(1000.0) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(3.0, result.returnValue! as! UFix64)
}

access(all)
fun testApproxLog10_BelowOne() {
    let result = runVaultScript(
        "access(all) fun main(): UFix64 { return YieldPetsVault.approxLog10(0.5) }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(0.0, result.returnValue! as! UFix64)
}

// ========================================
// Test: Contract constants
// ========================================

access(all)
fun testConstants() {
    let result = runVaultScript(
        "access(all) fun main(): [AnyStruct] { return [YieldPetsVault.MOREMARKETS_POOL, YieldPetsVault.PYUSD0, YieldPetsVault.PYUSD0_DECIMALS] }",
        []
    )
    Test.expect(result, Test.beSucceeded())
    let vals = result.returnValue! as! [AnyStruct]
    Test.assertEqual("0xbC92aaC2DBBF42215248B5688eB3D3d2b32F2c8d", vals[0] as! String)
    Test.assertEqual("0x99aF3EeA856556646C98c8B9b2548Fe815240750", vals[1] as! String)
    Test.assertEqual(UInt8(6), vals[2] as! UInt8)
}

// ========================================
// Test: VaultPosition setup transaction
// ========================================

access(all)
fun testSetupVaultPosition() {
    let acct = Test.createAccount()

    let setupCode = Test.readFile("../transactions/setup_vault.cdc")
    let setupTx = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    let setupResult = Test.executeTransaction(setupTx)
    Test.expect(setupResult, Test.beSucceeded())
}

access(all)
fun testSetupVaultPositionIdempotent() {
    let acct = Test.createAccount()
    let setupCode = Test.readFile("../transactions/setup_vault.cdc")

    let tx1 = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    Test.expect(Test.executeTransaction(tx1), Test.beSucceeded())

    let tx2 = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    Test.expect(Test.executeTransaction(tx2), Test.beSucceeded())
}

// ========================================
// Test: View functions after setup
// ========================================

access(all)
fun testTotalDepositedIsZeroAfterSetup() {
    let acct = Test.createAccount()
    let setupCode = Test.readFile("../transactions/setup_vault.cdc")
    let setupTx = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    Test.executeTransaction(setupTx)

    let result = runVaultScript(
        "access(all) fun main(addr: Address): UFix64 {\n"
            .concat("  let acct = getAccount(addr)\n")
            .concat("  let vault = acct.capabilities.borrow<&{YieldPetsVault.VaultPositionPublic}>(YieldPetsVault.VaultPublicPath)\n")
            .concat("    ?? panic(\"No vault\")\n")
            .concat("  return vault.getTotalDeposited()\n")
            .concat("}"),
        [acct.address]
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(0.0, result.returnValue! as! UFix64)
}

access(all)
fun testGrowthScoreZeroWithNoDeposits() {
    let acct = Test.createAccount()
    let setupCode = Test.readFile("../transactions/setup_vault.cdc")
    let setupTx = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    Test.executeTransaction(setupTx)

    let result = runVaultScript(
        "access(all) fun main(addr: Address): UFix64 {\n"
            .concat("  let acct = getAccount(addr)\n")
            .concat("  let vault = acct.capabilities.borrow<&{YieldPetsVault.VaultPositionPublic}>(YieldPetsVault.VaultPublicPath)\n")
            .concat("    ?? panic(\"No vault\")\n")
            .concat("  return vault.getGrowthScore()\n")
            .concat("}"),
        [acct.address]
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(0.0, result.returnValue! as! UFix64)
}

access(all)
fun testDepositCountZeroAfterSetup() {
    let acct = Test.createAccount()
    let setupCode = Test.readFile("../transactions/setup_vault.cdc")
    let setupTx = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    Test.executeTransaction(setupTx)

    let result = runVaultScript(
        "access(all) fun main(addr: Address): Int {\n"
            .concat("  let acct = getAccount(addr)\n")
            .concat("  let vault = acct.capabilities.borrow<&{YieldPetsVault.VaultPositionPublic}>(YieldPetsVault.VaultPublicPath)\n")
            .concat("    ?? panic(\"No vault\")\n")
            .concat("  return vault.getDepositCount()\n")
            .concat("}"),
        [acct.address]
    )
    Test.expect(result, Test.beSucceeded())
    Test.assertEqual(0, result.returnValue! as! Int)
}

access(all)
fun testGetEVMAddress() {
    let acct = Test.createAccount()
    let setupCode = Test.readFile("../transactions/setup_vault.cdc")
    let setupTx = Test.Transaction(
        code: setupCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: []
    )
    Test.executeTransaction(setupTx)

    let result = runVaultScript(
        "access(all) fun main(addr: Address): String {\n"
            .concat("  let acct = getAccount(addr)\n")
            .concat("  let vault = acct.capabilities.borrow<&{YieldPetsVault.VaultPositionPublic}>(YieldPetsVault.VaultPublicPath)\n")
            .concat("    ?? panic(\"No vault\")\n")
            .concat("  return vault.getEVMAddressHex()\n")
            .concat("}"),
        [acct.address]
    )
    Test.expect(result, Test.beSucceeded())
    let evmAddr = result.returnValue! as! String
    Test.assert(evmAddr.length > 0, message: "EVM address should not be empty")
}

// ========================================
// Test: Deposit fails without vault setup
// ========================================

access(all)
fun testDepositFailsWithoutSetup() {
    let acct = Test.createAccount()

    let depositCode = Test.readFile("../transactions/deposit_pyusd0.cdc")
    let tx = Test.Transaction(
        code: depositCode,
        authorizers: [acct.address],
        signers: [acct],
        arguments: [100.0]
    )
    let result = Test.executeTransaction(tx)
    Test.expect(result, Test.beFailed())
}
