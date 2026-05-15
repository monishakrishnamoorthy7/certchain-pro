// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ProductionCertificate
 * @dev Production grade certificate verification system with RBAC
 * - Uses OpenZeppelin AccessControl for role-based permissions
 * - Roles: SUPER_ADMIN_ROLE, UNIVERSITY_ADMIN_ROLE, DEPARTMENT_ADMIN_ROLE
 * - Only authorized roles can add/revoke certificates
 */
contract ProductionCertificate is AccessControl {
    
    // ============ Data Structures ============
    
    struct Certificate {
        string studentName;
        string course;
        uint256 issuedDate;
        bool isValid;
    }
    
    // ============ State Variables ============
    
    // Mapping: hash => Certificate
    mapping(string => Certificate) public certificates;
    
    // Track if a hash actually exists in the system
    mapping(string => bool) public certificateExists;

    // Role identifiers
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant UNIVERSITY_ADMIN_ROLE = keccak256("UNIVERSITY_ADMIN_ROLE");
    bytes32 public constant DEPARTMENT_ADMIN_ROLE = keccak256("DEPARTMENT_ADMIN_ROLE");
    
    // ============ Events ============
    
    event CertificateAdded(string indexed hash, string studentName, string course, uint256 issuedDate);
    event CertificateRevoked(string indexed hash);
    
    // ============ Modifiers ============
    
    // AccessControl provides `onlyRole` modifier; no custom modifiers needed
    
    // ============ Constructor ============
    
    constructor() {
        // Grant deployer the super admin role and make it the role admin
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);
        // Also grant deployer the university and department admin roles
        // so the deployer can add/revoke certificates without needing
        // an additional transaction to grant those roles.
        _grantRole(UNIVERSITY_ADMIN_ROLE, msg.sender);
        _grantRole(DEPARTMENT_ADMIN_ROLE, msg.sender);
        // SUPER_ADMIN_ROLE will be the admin for other roles
        _setRoleAdmin(UNIVERSITY_ADMIN_ROLE, SUPER_ADMIN_ROLE);
        _setRoleAdmin(DEPARTMENT_ADMIN_ROLE, SUPER_ADMIN_ROLE);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Add a new certificate (Admin only)
     */
    function addCertificate(
        string memory _hash, 
        string memory _studentName, 
        string memory _course, 
        uint256 _issuedDate
    ) public onlyRole(UNIVERSITY_ADMIN_ROLE) {
        require(!certificateExists[_hash], "Certificate hash already exists");

        certificates[_hash] = Certificate({
            studentName: _studentName,
            course: _course,
            issuedDate: _issuedDate,
            isValid: true
        });
        certificateExists[_hash] = true;

        emit CertificateAdded(_hash, _studentName, _course, _issuedDate);
    }
    
    /**
     * @dev Revoke an existing certificate (Admin only)
     */
    function revokeCertificate(string memory _hash) public onlyRole(UNIVERSITY_ADMIN_ROLE) {
        require(certificateExists[_hash], "Certificate does not exist");
        require(certificates[_hash].isValid, "Certificate is already revoked");

        certificates[_hash].isValid = false;

        emit CertificateRevoked(_hash);
    }
    
    // ============ Public Functions ============
    
    /**
     * @dev Verify and return full certificate data
     */
    function verifyCertificate(string memory _hash) public view returns (Certificate memory) {
        require(certificateExists[_hash], "Certificate not found");
        return certificates[_hash];
    }
}
