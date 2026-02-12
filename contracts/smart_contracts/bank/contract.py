from algopy import *
from algopy.arc4 import abimethod


class ScholarshipPool(ARC4Contract):

    # Total funds held by contract
    total_funds: UInt64

    # Governance token ASA ID (for voting)
    governance_token: UInt64

    # Identity token contract for access control
    identity_contract: UInt64

    # Student ID Token ASA ID (for application access)
    student_id_asa: UInt64

    def __init__(self) -> None:
        # donor address → contribution amount
        self.donations = BoxMap(Account, UInt64, key_prefix="d")

        # student address → awarded amount
        self.awards = BoxMap(Account, UInt64, key_prefix="a")

        # student address → has received NFT badge
        self.badge_recipients = BoxMap(Account, UInt64, key_prefix="b")

        self.total_funds = UInt64(0)
        self.governance_token = UInt64(0)
        self.identity_contract = UInt64(0)
        self.student_id_asa = UInt64(0)

    # ==============================
    # ADMIN SETUP
    # ==============================

    @abimethod()
    def set_governance_token(self, token_id: UInt64) -> None:
        assert Txn.sender == Global.creator_address
        self.governance_token = token_id

    @abimethod()
    def set_identity_contract(self, contract_id: UInt64) -> None:
        """Set the identity token contract address"""
        assert Txn.sender == Global.creator_address, "Only admin"
        self.identity_contract = contract_id

    @abimethod()
    def set_student_id_asa(self, asa_id: UInt64) -> None:
        """Set the student ID token ASA ID"""
        assert Txn.sender == Global.creator_address, "Only admin"
        self.student_id_asa = asa_id

    # ==============================
    # DONOR CONTRIBUTION
    # ==============================

    @abimethod()
    def contribute(self, payment: gtxn.PaymentTransaction) -> UInt64:
        assert payment.receiver == Global.current_application_address
        assert payment.amount > 0

        current, exists = self.donations.maybe(Txn.sender)
        if exists:
            self.donations[Txn.sender] = current + payment.amount
        else:
            self.donations[Txn.sender] = payment.amount

        self.total_funds += payment.amount
        return self.donations[Txn.sender]

    # ==============================
    # STUDENT APPLICATION WITH ACCESS CONTROL
    # ==============================

    @abimethod()
    def apply_for_scholarship(self) -> UInt64:
        """
        Student applies for scholarship.
        REQUIRES: Student ID Token
        """
        # ACCESS CONTROL: Check Student ID Token
        if self.student_id_asa > UInt64(0):
            # Verify student has Student ID token
            student_balance = Txn.sender.asset_holding(self.student_id_asa).balance
            assert student_balance >= UInt64(1), "Must hold Student ID Token to apply"

        # Record application (implementation handled in voting contract)
        # This is a gated entry point to verify access
        return UInt64(1)

    # ==============================

    @abimethod()
    def award_scholarship(self, student: Account, amount: UInt64) -> UInt64:
        assert Txn.sender == Global.creator_address
        assert amount > 0
        assert amount <= self.total_funds

        current, exists = self.awards.maybe(student)
        if exists:
            self.awards[student] = current + amount
        else:
            self.awards[student] = amount

        # Send ALGO to student
        itxn.Payment(
            receiver=student,
            amount=amount,
            fee=0
        ).submit()

        self.total_funds -= amount
        return self.awards[student]

    @abimethod()
    def mark_badge_recipient(self, student: Account) -> None:
        assert Txn.sender == Global.creator_address
        self.badge_recipients[student] = UInt64(1)

    # ==============================
    # VIEW FUNCTIONS
    # ==============================

    @abimethod(readonly=True)
    def get_donation(self, donor: Account) -> UInt64:
        amount, exists = self.donations.maybe(donor)
        return amount if exists else UInt64(0)

    @abimethod(readonly=True)
    def get_award(self, student: Account) -> UInt64:
        amount, exists = self.awards.maybe(student)
        return amount if exists else UInt64(0)

    @abimethod(readonly=True)
    def get_total_funds(self) -> UInt64:
        return self.total_funds

    @abimethod(readonly=True)
    def has_badge(self, student: Account) -> bool:
        _, ok = self.badge_recipients.maybe(student)        return ok

    @abimethod(readonly=True)
    def get_student_id_asa(self) -> UInt64:
        """Get Student ID Token ASA ID"""
        return self.student_id_asa