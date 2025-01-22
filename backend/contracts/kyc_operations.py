from web3 import Web3
from eth_typing import Address
from typing import Tuple, Dict, Any
from decimal import Decimal
import json

class KycOperations:
    def __init__(self, web3: Web3, contract_address: str, private_key: str = None):
        self.web3 = web3
        self.contract_address = Web3.to_checksum_address(contract_address)
        
        # Load ABI
        with open('abis/KycSBT.json', 'r') as f:
            self.contract_abi = json.load(f)
        
        self.contract = self.web3.eth.contract(
            address=self.contract_address, 
            abi=self.contract_abi
        )
        
        # Setup account if private key provided
        self.account = None
        if private_key:
            self.account = self.web3.eth.account.from_key(private_key)

class UserOperations(KycOperations):
    def get_total_fee(self) -> int:
        """Get total fee required for KYC registration"""
        try:
            return self.contract.functions.getTotalFee().call()
        except Exception as e:
            print(f"Error getting total fee: {e}")
            raise

    def get_kyc_info(self, address: str) -> Dict[str, Any]:
        """
        Get KYC information for an address
        
        Returns:
            Dict containing:
            - ensName: str
            - level: int (0=NONE, 1=BASIC, 2=ADVANCED, 3=PREMIUM, 4=ULTIMATE)
            - status: int (0=NONE, 1=PENDING, 2=APPROVED, 3=REVOKED)
            - createTime: int
        """
        try:
            address = Web3.to_checksum_address(address)
            info = self.contract.functions.getKycInfo(address).call()
            return {
                'ensName': info[0],
                'level': info[1],
                'status': info[2],
                'createTime': info[3]
            }
        except Exception as e:
            print(f"Error getting KYC info: {e}")
            raise

    def is_human(self, address: str) -> Tuple[bool, int]:
        """
        Quick check if an address is human verified
        
        Returns:
            Tuple of (is_valid: bool, level: int)
        """
        try:
            address = Web3.to_checksum_address(address)
            return self.contract.functions.isHuman(address).call()
        except Exception as e:
            print(f"Error checking human status: {e}")
            raise

    def request_kyc(self, ens_name: str) -> Dict[str, Any]:
        """Request KYC verification with ENS name"""
        if not self.account:
            raise Exception("Private key not provided")
        
        try:
            total_fee = self.get_total_fee()
            
            # Build transaction
            tx = self.contract.functions.requestKyc(ens_name).build_transaction({
                'from': self.account.address,
                'value': total_fee,
                'nonce': self.web3.eth.get_transaction_count(self.account.address),
                'gas': 2000000,  # Adjust as needed
                'gasPrice': self.web3.eth.gas_price
            })
            
            # Sign and send transaction
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for transaction receipt
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt
        except Exception as e:
            print(f"Error requesting KYC: {e}")
            raise

class OwnerOperations(KycOperations):
    def set_registration_fee(self, new_fee: int) -> Dict[str, Any]:
        """Set new registration fee"""
        if not self.account:
            raise Exception("Private key not provided")
            
        try:
            tx = self.contract.functions.setRegistrationFee(new_fee).build_transaction({
                'from': self.account.address,
                'nonce': self.web3.eth.get_transaction_count(self.account.address),
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price
            })
            
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return self.web3.eth.wait_for_transaction_receipt(tx_hash)
        except Exception as e:
            print(f"Error setting registration fee: {e}")
            raise

    def approve_kyc(self, user_address: str) -> Dict[str, Any]:
        """Approve KYC for a user"""
        if not self.account:
            raise Exception("Private key not provided")
            
        try:
            user_address = Web3.to_checksum_address(user_address)
            tx = self.contract.functions.approveKyc(user_address).build_transaction({
                'from': self.account.address,
                'nonce': self.web3.eth.get_transaction_count(self.account.address),
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price
            })
            
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return self.web3.eth.wait_for_transaction_receipt(tx_hash)
        except Exception as e:
            print(f"Error approving KYC: {e}")
            raise

    def get_contract_config(self) -> Dict[str, Any]:
        """Get contract configuration"""
        try:
            return {
                'registrationFee': self.contract.functions.registrationFee().call(),
                'ensFee': self.contract.functions.ensFee().call(),
                'minNameLength': self.contract.functions.minNameLength().call(),
                'suffix': self.contract.functions.suffix().call(),
                'validityPeriod': self.contract.functions.validityPeriod().call()
            }
        except Exception as e:
            print(f"Error getting contract config: {e}")
            raise

# Usage example:
if __name__ == "__main__":
    # Initialize Web3
    w3 = Web3(Web3.HTTPProvider('https://hk-testnet.rpc.alt.technology'))
    
    # Contract address from environment
    CONTRACT_ADDRESS = "0xC4fd036Df0f5f3375C0117995793625059de656B"
    
    # Initialize operations
    user_ops = UserOperations(w3, CONTRACT_ADDRESS)
    
    # Example: Get KYC info
    address = "0x123..."
    kyc_info = user_ops.get_kyc_info(address)
    print(f"KYC Info: {kyc_info}") 