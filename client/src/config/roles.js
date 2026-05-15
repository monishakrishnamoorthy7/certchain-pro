import * as ethers from "ethers";

// Shared role constants used by frontend UI and services. Generate using
// the same keccak256(bytes) of the role string that the Solidity
// contract declares so both sides match exactly.
export const ROLES = {
  SUPER_ADMIN_ROLE: ethers.keccak256(ethers.toUtf8Bytes("SUPER_ADMIN_ROLE")),
  UNIVERSITY_ADMIN_ROLE: ethers.keccak256(ethers.toUtf8Bytes("UNIVERSITY_ADMIN_ROLE")),
  DEPARTMENT_ADMIN_ROLE: ethers.keccak256(ethers.toUtf8Bytes("DEPARTMENT_ADMIN_ROLE"))
};

export default ROLES;
