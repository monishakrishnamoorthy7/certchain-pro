/**
 * Test Suite for Certificate Verification System
 * Simple tests to verify the system works correctly
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API_URL = "http://localhost:3000";

// ============ Test Utilities ============

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.log(`❌ ${message}`);
        testsFailed++;
    }
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============ Create Test File ============

function createTestFile() {
    const testFilePath = path.join(__dirname, "test-certificate.txt");
    const content = `Test Certificate\nGenerated: ${new Date().toISOString()}`;
    fs.writeFileSync(testFilePath, content);
    return testFilePath;
}

// ============ Test Functions ============

async function testHealthCheck() {
    console.log("\n🧪 Testing Health Check...");
    try {
        const response = await fetch(`${API_URL}/health`);
        assert(response.ok, "Health check responds with 200 OK");
        
        const data = await response.json();
        assert(data.success === true, "Response has success flag");
        assert(data.blockchain?.connected, "Blockchain is connected");
    } catch (error) {
        assert(false, `Health check failed: ${error.message}`);
    }
}

async function testGetStatus() {
    console.log("\n🧪 Testing Get Status...");
    try {
        const response = await fetch(`${API_URL}/api/status`);
        assert(response.ok, "Status endpoint responds with 200 OK");
        
        const data = await response.json();
        assert(data.success === true, "Response has success flag");
        assert(data.blockchain?.contractAddress, "Contract address is present");
        assert(data.blockchain?.certificateCount !== undefined, "Certificate count is present");
    } catch (error) {
        assert(false, `Get status failed: ${error.message}`);
    }
}

async function testFileUpload() {
    console.log("\n🧪 Testing File Upload...");
    try {
        const testFilePath = createTestFile();
        const fileBuffer = fs.readFileSync(testFilePath);
        
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: "text/plain" });
        formData.append("file", blob, "test-certificate.txt");

        const response = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            assert(data.success === true, "Upload response has success flag");
            assert(data.data?.hash, "Response includes certificate hash");
            assert(data.data?.transactionHash, "Response includes transaction hash");
            assert(data.data?.blockNumber, "Response includes block number");
            
            // Save hash for verification test
            global.testHash = data.data.hash;
        } else {
            const error = await response.json();
            assert(false, `Upload failed: ${error.message}`);
        }
        
        // Cleanup
        fs.unlinkSync(testFilePath);
    } catch (error) {
        assert(false, `File upload test failed: ${error.message}`);
    }
}

async function testFileVerification() {
    console.log("\n🧪 Testing File Verification...");
    try {
        const testFilePath = createTestFile();
        const fileBuffer = fs.readFileSync(testFilePath);
        
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: "text/plain" });
        formData.append("file", blob, "test-certificate.txt");

        const response = await fetch(`${API_URL}/api/verify`, {
            method: "POST",
            body: formData,
        });

        assert(response.ok, "Verify endpoint responds correctly");
        
        const data = await response.json();
        assert(data.success === true, "Verify response has success flag");
        assert(data.data?.hash, "Response includes hash");
        assert(data.data?.isValid !== undefined, "Response includes validation result");
        
        // Cleanup
        fs.unlinkSync(testFilePath);
    } catch (error) {
        assert(false, `File verification test failed: ${error.message}`);
    }
}

async function testVerifyByHash() {
    console.log("\n🧪 Testing Verify by Hash...");
    try {
        if (!global.testHash) {
            console.log("⚠️  Skipping (no test hash available - run upload test first)");
            return;
        }

        const response = await fetch(`${API_URL}/api/verify-hash`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hash: global.testHash }),
        });

        assert(response.ok, "Verify-hash endpoint responds correctly");
        
        const data = await response.json();
        assert(data.success === true, "Verify-hash response has success flag");
        assert(data.data?.isValid === true, "Uploaded certificate is valid");
    } catch (error) {
        assert(false, `Verify by hash test failed: ${error.message}`);
    }
}

async function testInvalidHash() {
    console.log("\n🧪 Testing Invalid Hash Handling...");
    try {
        const invalidHash = "0000000000000000000000000000000000000000000000000000000000000000";
        
        const response = await fetch(`${API_URL}/api/verify-hash`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hash: invalidHash }),
        });

        assert(response.ok, "Invalid hash request handled gracefully");
        
        const data = await response.json();
        assert(data.data?.isValid === false, "Invalid hash correctly identified as invalid");
    } catch (error) {
        assert(false, `Invalid hash test failed: ${error.message}`);
    }
}

async function testMissingFile() {
    console.log("\n🧪 Testing Missing File Handling...");
    try {
        const formData = new FormData();
        
        const response = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            body: formData,
        });

        assert(response.status === 400, "Missing file returns 400 Bad Request");
        
        const data = await response.json();
        assert(data.success === false, "Error response has success: false");
    } catch (error) {
        assert(false, `Missing file test failed: ${error.message}`);
    }
}

// ============ Run All Tests ============

async function runAllTests() {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║   Certificate Verification System Tests    ║");
    console.log("╚════════════════════════════════════════════╝");

    // Check if server is running
    try {
        await fetch(`${API_URL}/health`);
    } catch (error) {
        console.error("❌ Server is not running at", API_URL);
        console.error("Please start the server with: npm run dev");
        process.exit(1);
    }

    // Run tests in sequence
    await testHealthCheck();
    await sleep(500);
    
    await testGetStatus();
    await sleep(500);
    
    await testFileUpload();
    await sleep(1000);
    
    await testFileVerification();
    await sleep(1000);
    
    await testVerifyByHash();
    await sleep(500);
    
    await testInvalidHash();
    await sleep(500);
    
    await testMissingFile();

    // Print summary
    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   Test Summary                             ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📊 Total:  ${testsPassed + testsFailed}`);
    console.log("");

    if (testsFailed === 0) {
        console.log("🎉 All tests passed! System is working correctly.");
        process.exit(0);
    } else {
        console.log("⚠️  Some tests failed. Please check the errors above.");
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testHealthCheck,
    testGetStatus,
    testFileUpload,
    testFileVerification,
    testVerifyByHash,
    testInvalidHash,
    testMissingFile,
};
