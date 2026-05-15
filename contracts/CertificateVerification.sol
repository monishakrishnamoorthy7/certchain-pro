// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificateVerification
 * @dev Enhanced certificate storage with metadata, IPFS integration, and revocation
 * @author Your Name
 */
contract CertificateVerification {
    
    // ============ Data Structures ============
    
    /// @dev Certificate metadata structure
    struct Certificate {
        string ipfsCID;              // IPFS Content Identifier (decentralized storage)
        string studentName;          // Certificate holder name
        string course;               // Course or certification name
        uint256 issuedDate;          // Timestamp when certificate was issued
        address issuedBy;            // Address of issuer
        bool exists;                 // Whether certificate exists
    }
    
    // ============ State Variables ============
    
    /// @dev Maps hash to Certificate metadata
    mapping(string => Certificate) public certificates;
    
    /// @dev Maps hash to revocation status
    mapping(string => bool) public revoked;
    
    /// @dev Owner of the contract - only owner can add certificates
    address public owner;
    
    /// @dev Total number of certificates stored
    uint256 public certificateCount;
    
    // ============ Events ============
    
    /// @dev Emitted when a certificate is added with metadata
    event CertificateAdded(
        string indexed hash,
        string ipfsCID,
        string studentName,
        string course,
        address indexed issuedBy,
        uint256 timestamp
    );
    
    /// @dev Emitted when a certificate is revoked
    event CertificateRevoked(
        string indexed hash,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    /// @dev Emitted when a certificate is restored
    event CertificateRestored(
        string indexed hash,
        address indexed restoredBy,
        uint256 timestamp
    );
    
    /// @dev Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // ============ Modifiers ============
    
    /// @dev Ensures only contract owner can call the function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @dev Initializes the contract and sets the deployer as owner
     */
    constructor() {
        owner = msg.sender;
        certificateCount = 0;
    }
    
    // ============ Certificate Management Functions ============
    
    /**
     * @dev Adds a new certificate with full metadata to blockchain
     * @param _hash SHA-256 hash of the certificate file
     * @param _studentName Name of the certificate holder
     * @param _course Name of the course or certification
     * @param _issuedDate Timestamp when certificate was issued
     * @param _ipfsCID IPFS Content Identifier for decentralized storage
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Hash must not be empty
     * - Hash must not already exist
     */
    function addCertificateWithMetadata(
        string memory _hash,
        string memory _studentName,
        string memory _course,
        uint256 _issuedDate,
        string memory _ipfsCID
    ) public onlyOwner {
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        require(!certificates[_hash].exists, "Certificate already exists");
        require(bytes(_studentName).length > 0, "Student name cannot be empty");
        require(bytes(_course).length > 0, "Course name cannot be empty");
        require(_issuedDate > 0, "Issued date must be valid");
        
        // Store certificate with metadata
        certificates[_hash] = Certificate({
            ipfsCID: _ipfsCID,
            studentName: _studentName,
            course: _course,
            issuedDate: _issuedDate,
            issuedBy: msg.sender,
            exists: true
        });
        
        certificateCount++;
        
        emit CertificateAdded(_hash, _ipfsCID, _studentName, _course, msg.sender, _issuedDate);
    }
    
    /**
     * @dev Adds a new certificate with full metadata to blockchain
     * Legacy function name - calls addCertificateWithMetadata
     * @param _hash SHA-256 hash of the certificate file
     * @param _ipfsCID IPFS Content Identifier for decentralized storage
     * @param _studentName Name of the certificate holder
     * @param _course Name of the course or certification
     */
    function addCertificate(
        string memory _hash,
        string memory _ipfsCID,
        string memory _studentName,
        string memory _course
    ) public onlyOwner {
        addCertificateWithMetadata(_hash, _studentName, _course, block.timestamp, _ipfsCID);
    }
    
    /**
     * @dev Verifies if a certificate exists and is not revoked
     * @param _hash SHA-256 hash of the certificate file
     * @return bool True if certificate is valid and not revoked
     */
    function verifyCertificate(string memory _hash) public view returns (bool) {
        return certificates[_hash].exists && !revoked[_hash];
    }
    
    /**
     * @dev Gets full certificate metadata
     * @param _hash SHA-256 hash of the certificate
     * @return Certificate struct with all metadata
     */
    function getCertificateDetails(string memory _hash) public view returns (Certificate memory) {
        require(certificates[_hash].exists, "Certificate does not exist");
        return certificates[_hash];
    }
    
    /**
     * @dev Revokes a certificate (cannot be undone to maintain audit trail)
     * @param _hash SHA-256 hash of the certificate to revoke
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Certificate must exist
     * - Certificate must not already be revoked
     */
    function revokeCertificate(string memory _hash) public onlyOwner {
        require(certificates[_hash].exists, "Certificate does not exist");
        require(!revoked[_hash], "Certificate already revoked");
        
        revoked[_hash] = true;
        
        emit CertificateRevoked(_hash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Restores a revoked certificate
     * @param _hash SHA-256 hash of the certificate to restore
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Certificate must exist and be revoked
     */
    function restoreCertificate(string memory _hash) public onlyOwner {
        require(certificates[_hash].exists, "Certificate does not exist");
        require(revoked[_hash], "Certificate is not revoked");
        
        revoked[_hash] = false;
        
        emit CertificateRestored(_hash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Checks if a certificate is revoked
     * @param _hash SHA-256 hash of the certificate
     * @return bool True if revoked, false otherwise
     */
    function isCertificateRevoked(string memory _hash) public view returns (bool) {
        return revoked[_hash];
    }
    
    /**
     * @dev Adds multiple certificates in a single transaction (gas efficient)
     * @param _hashes Array of certificate hashes
     * @param _ipfsCIDs Array of IPFS CIDs (must match _hashes length)
     * @param _studentNames Array of student names
     * @param _courses Array of course names
     */
    function addMultipleCertificates(
        string[] memory _hashes,
        string[] memory _ipfsCIDs,
        string[] memory _studentNames,
        string[] memory _courses
    ) public onlyOwner {
        require(_hashes.length > 0, "Array cannot be empty");
        require(
            _hashes.length == _ipfsCIDs.length &&
            _hashes.length == _studentNames.length &&
            _hashes.length == _courses.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < _hashes.length; i++) {
            addCertificate(_hashes[i], _ipfsCIDs[i], _studentNames[i], _courses[i]);
        }
    }
    
    /**
     * @dev Transfers contract ownership to a new address
     * @param _newOwner Address of the new owner
     * 
     * Requirements:
     * - Caller must be the current owner
     * - New owner cannot be zero address
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        
        address previousOwner = owner;
        owner = _newOwner;
        
        emit OwnershipTransferred(previousOwner, _newOwner);
    }
    
    /**
     * @dev Gets the total number of certificates stored
     * @return uint256 Number of certificates
     */
    function getCertificateCount() public view returns (uint256) {
        return certificateCount;
    }
}
