// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleCertificateVerification
 * @dev Minimal certificate verification system
 * - Stores only certificate hashes
 * - No metadata, no revocation, no complexity
 * - Simple add and verify functions
 */
contract SimpleCertificateVerification {
    
    // ============ State Variables ============
    
    /// @dev Maps hash to existence status (true = certificate exists)
    mapping(string => bool) public certificates;
    
    /// @dev Owner of the contract
    address public owner;
    
    /// @dev Total number of certificates
    uint256 public certificateCount;
    
    // ============ Events ============
    
    /// @dev Emitted when a certificate is added
    event CertificateAdded(string indexed hash, address indexed addedBy, uint256 timestamp);
    
    // ============ Modifiers ============
    
    /// @dev Ensures only owner can call the function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // ============ Constructor ============
    
    /// @dev Initializes contract and sets deployer as owner
    constructor() {
        owner = msg.sender;
        certificateCount = 0;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Adds a new certificate to the blockchain
     * @param _hash SHA-256 hash of the certificate file
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Hash must not already exist
     */
    function addCertificate(string memory _hash) public onlyOwner {
        require(!certificates[_hash], "Certificate already exists");
        certificates[_hash] = true;
        certificateCount++;
        emit CertificateAdded(_hash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verifies if a certificate exists
     * @param _hash SHA-256 hash of the certificate file
     * @return bool True if certificate exists, false otherwise
     */
    function verifyCertificate(string memory _hash) public view returns (bool) {
        return certificates[_hash];
    }
    
    // ============ Utility Functions ============
    
    /**
     * @dev Gets the total number of certificates stored
     * @return Number of certificates in the system
     */
    function getCertificateCount() public view returns (uint256) {
        return certificateCount;
    }
}
