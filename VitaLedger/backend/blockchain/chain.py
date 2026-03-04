import time
from security.encryption import hash_data
from utils.audit import log_audit

class Block:
    def __init__(self, index: int, timestamp: float, record_hash: str, previous_hash: str, doctor_id: str):
        self.index = index
        self.timestamp = timestamp
        self.record_hash = record_hash
        self.previous_hash = previous_hash
        self.doctor_id = doctor_id
        self.block_hash = self.calculate_hash()
        
    def calculate_hash(self):
        block_string = f"{self.index}{self.timestamp}{self.record_hash}{self.previous_hash}{self.doctor_id}"
        return hash_data(block_string)

class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]
        
    def create_genesis_block(self):
        return Block(0, time.time(), "0", "0", "system")
        
    def get_latest_block(self):
        return self.chain[-1]
        
    def add_block(self, record_hash: str, doctor_id: str):
        prev_block = self.get_latest_block()
        new_block = Block(
            index=prev_block.index + 1,
            timestamp=time.time(),
            record_hash=record_hash,
            previous_hash=prev_block.block_hash,
            doctor_id=doctor_id
        )
        self.chain.append(new_block)
        log_audit("system", "blockchain_append", f"Added block {new_block.index} to ledger")
        return new_block

ledger = Blockchain()
