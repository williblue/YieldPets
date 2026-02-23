import Test

access(all)
fun setup() {
    // First, try to deploy and see what error we get
    let err = Test.deployContract(
        name: "YieldPetsVault",
        path: "../contracts/YieldPetsVault.cdc",
        arguments: []
    )
    if err != nil {
        log("Deploy error: ".concat(err!.message))
    }
    Test.expect(err, Test.beNil())
}

access(all)
fun testDummy() {
    Test.assert(true, message: "dummy test")
}
